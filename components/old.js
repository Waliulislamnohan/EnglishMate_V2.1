import { useState, useEffect } from 'react';

// Fetch Case Scenarios from Cohere LLM API
const fetchCaseScenarios = async () => {
  const response = await fetch('/api/cohere', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: "Suggest a list of common English conversation scenarios." }),
  });

  const data = await response.json();
  return data.text; // Adjust based on the response format from the LLM
};

// Fetch Conversation Details from Cohere API
const fetchScenarioDetails = async (scenario) => {
  const response = await fetch('/api/cohere', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: `Give the conversation for this scenario: ${scenario}, along with Bangla translation.` }),
  });

  const data = await response.json();
  return data.text;
};

// Helper function to format conversation into individual blocks
const formatScenarioDetails = (details) => {
  const lines = details.split('\n'); // Split conversation by line breaks
  const formattedLines = lines.filter(line => line.trim() !== ""); // Remove empty lines
  return formattedLines.map((line, index) => {
    const [english, bangla] = line.split(' - '); // Assuming LLM returns in "English - Bangla" format
    return { english: english.trim(), bangla: bangla?.trim() || "" };
  });
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // Track if 10-Minute Help is shown
  const [scenarios, setScenarios] = useState([]); // Store scenarios from LLM
  const [selectedScenario, setSelectedScenario] = useState(null); // Store selected scenario details
  const [scenarioDetails, setScenarioDetails] = useState([]); // Formatted conversation details

  // Fetch the list of scenarios when "10-Minute English Help" is clicked
  useEffect(() => {
    if (showHelp) {
      fetchCaseScenarios().then((result) => {
        const scenariosArray = result.split('\n').filter(scenario => scenario); // Convert LLM response to an array
        setScenarios(scenariosArray);
      });
    }
  }, [showHelp]);

  // Handle Scenario Click and Fetch Conversation
  const handleScenarioClick = (scenario) => {
    setLoading(true);
    fetchScenarioDetails(scenario).then((result) => {
      const formattedDetails = formatScenarioDetails(result); // Format the conversation details
      setScenarioDetails(formattedDetails);
      setSelectedScenario(scenario);
      setLoading(false);
    });
  };

  // Send Message to Cohere API and Update State
  const sendMessage = async () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setLoading(true);

      try {
        const response = await fetchScenarioDetails(input);
        setMessages((prev) => [...prev, { text: response, sender: 'bot' }]);
      } catch (error) {
        setMessages((prev) => [...prev, { text: "Error retrieving response. Try again.", sender: 'bot' }]);
      }

      setInput('');  // Clear input
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <div className="md:w-64 p-4 border-r flex flex-col bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-4">EnglishMate</h2>
        <ul className="flex-1 space-y-4">
          <li 
            className="cursor-pointer hover:bg-gray-100 p-2 rounded-md" 
            onClick={() => setShowHelp(true)}
          >
            10-Minute English Help
          </li>
          <li className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">Grammar basics</li>
          <li className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">Vocabulary lessons</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col shadow-lg overflow-auto">
        {showHelp ? (
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">10-Minute English Help</h2>

            {loading ? (
              <p>Loading scenarios...</p>
            ) : (
              <div className="overflow-auto h-96">
                <ul className="space-y-4">
                  {scenarios.map((scenario, index) => (
                    <li
                      key={index}
                      className="cursor-pointer p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200"
                      onClick={() => handleScenarioClick(scenario)}
                    >
                      {scenario}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedScenario && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Conversation for: {selectedScenario}</h3>
                <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                  {scenarioDetails.map((line, index) => (
                    <div key={index} className="p-2 border-b">
                      <p className="text-gray-800"><strong>English:</strong> {line.english}</p>
                      <p className="text-gray-600"><strong>Bangla:</strong> {line.bangla}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-purple-700 p-4 text-white flex items-center shadow-lg">
              <input
                type="text"
                placeholder="Type your English query here"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="w-full p-2 rounded-full border-none outline-none text-gray-700"
              />
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto bg-white space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : ''}`}>
                  <div className={`bg-${message.sender === 'user' ? 'purple-100' : 'gray-200'} p-4 rounded-lg max-w-md`}>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gray-100 border-t flex items-center">
              <input
                type="text"
                placeholder="Type a new message..."
                className="flex-1 p-2 border border-gray-300 rounded-full outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={sendMessage} className="ml-4 px-6 py-2 bg-purple-700 text-white rounded-full">
                {loading ? "Loading..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right Panel (Visible on desktop) */}
      <div className="hidden md:block md:w-64 p-4 border-l bg-gray-200 shadow-lg md:order-3">
        <div className="text-center">
          <img src="https://i.ibb.co/frrrVpd/tutor.png" alt="Chatbot" className="w-24 h-24 rounded-full mx-auto mb-4" />
          <h3 className="text-xl font-semibold">EnglishMate AI Chatbot</h3>
          <p className="text-gray-600">Active now</p>
        </div>
        <div className="mt-6 text-sm text-gray-700">
          <p><strong>Position:</strong> English Language Tutor</p>
          <p><strong>Email:</strong> contact@englishmate.co</p>
          <p><strong>Local time:</strong> 11:58 AM</p>
        </div>
      </div>
    </div>
  );
}
