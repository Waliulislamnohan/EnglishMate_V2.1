// components/ChatInterface.js

import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

// Fetch Case Scenarios from Cohere LLM API
const fetchCaseScenarios = async () => {
  const response = await fetch('/api/cohere', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: "Suggest a list of common English conversation scenarios or English conversation cases." }),
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
    body: JSON.stringify({ prompt: `Provide an English conversation for the scenario: "${scenario}".` }),
  });

  const data = await response.json();
  return data.text;
};

// Fetch Grammar Topics from Cohere LLM API
const fetchGrammarTopics = async () => {
  const response = await fetch('/api/cohere', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: "Provide a list of essential English grammar topics for beginners." }),
  });

  const data = await response.json();
  return data.text; // Adjust based on the response format from the LLM
};

// Fetch Grammar Details from Cohere API
const fetchGrammarDetails = async (topic) => {
  const response = await fetch('/api/cohere', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: `Explain the English grammar topic: "${topic}". Provide examples.` }),
  });

  const data = await response.json();
  return data.text;
};

// Translate text using the translation API
const translateText = async (text, targetLang = 'bn') => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.translatedText;
  } catch (error) {
    console.error('Translation failed:', error);
    return 'Translation unavailable';
  }
};

// Helper function to format conversation into individual blocks
const formatScenarioDetails = async (details) => {
  const lines = details.split('\n').filter(line => line.trim() !== "");
  const translationPromises = lines.map(async (line) => {
    const english = line.trim();
    try {
      const bangla = await translateText(english);
      return { english, bangla };
    } catch (error) {
      console.error('Translation failed for line:', english, error);
      return { english, bangla: "Translation unavailable: " + error.message };
    }
  });

  const formattedLines = await Promise.all(translationPromises);
  return formattedLines;
};

// Helper function to format grammar details
const formatGrammarDetails = async (details) => {
  const paragraphs = details.split('\n\n').filter(paragraph => paragraph.trim() !== "");
  const translationPromises = paragraphs.map(async (paragraph) => {
    const english = paragraph.trim();
    try {
      const bangla = await translateText(english);
      return { english, bangla };
    } catch (error) {
      console.error('Translation failed for paragraph:', english, error);
      return { english, bangla: "Translation unavailable: " + error.message };
    }
  });

  const formattedParagraphs = await Promise.all(translationPromises);
  return formattedParagraphs;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Sidebar Sections State
  const [showHelp, setShowHelp] = useState(true);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);

  // Help Section State
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioDetails, setScenarioDetails] = useState([]);
  const [hasMoreScenarios, setHasMoreScenarios] = useState(true);

  // Grammar Basics Section State
  const [grammarTopics, setGrammarTopics] = useState([]);
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  const [grammarDetails, setGrammarDetails] = useState([]);
  const [hasMoreGrammar, setHasMoreGrammar] = useState(true);

  // Vocabulary Lessons Section State
  const [vocabularyLessons, setVocabularyLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [hasMoreVocabulary, setHasMoreVocabulary] = useState(true);

  // State to manage sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch the list of scenarios
  const loadScenarios = async () => {
    try {
      const result = await fetchCaseScenarios();
      const newScenarios = result.split('\n').filter(scenario => scenario);

      // Prevent duplicates
      setScenarios((prev) => {
        const combined = [...prev, ...newScenarios];
        const uniqueScenarios = Array.from(new Set(combined));
        return uniqueScenarios;
      });

      // If no more scenarios are returned, set hasMoreScenarios to false
      if (newScenarios.length === 0) {
        setHasMoreScenarios(false);
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      setHasMoreScenarios(false);
    }
  };

  // Fetch Grammar Topics
  const loadGrammarTopics = async () => {
    try {
      const result = await fetchGrammarTopics();
      const newTopics = result.split('\n').filter(topic => topic);

      // Prevent duplicates
      setGrammarTopics((prev) => {
        const combined = [...prev, ...newTopics];
        const uniqueTopics = Array.from(new Set(combined));
        return uniqueTopics;
      });

      // If no more topics are returned, set hasMoreGrammar to false
      if (newTopics.length === 0) {
        setHasMoreGrammar(false);
      }
    } catch (error) {
      console.error("Error fetching grammar topics:", error);
      setHasMoreGrammar(false);
    }
  };

  // Fetch Vocabulary Lessons
  const loadVocabularyLessons = async () => {
    try {
      // Example static lessons; replace with API calls if needed
      const lessons = [
        { id: 1, title: 'Common Greetings', description: 'Learn how to greet people in English.' },
        { id: 2, title: 'Food Vocabulary', description: 'Words related to food and dining.' },
        { id: 3, title: 'Travel Phrases', description: 'Useful phrases when traveling abroad.' },
        // Add more lessons as needed
      ];
      setVocabularyLessons((prev) => {
        const combined = [...prev, ...lessons];
        // If no more lessons to load, set hasMoreVocabulary to false
        if (lessons.length === 0) {
          setHasMoreVocabulary(false);
        }
        return combined;
      });
    } catch (error) {
      console.error("Error fetching vocabulary lessons:", error);
      setHasMoreVocabulary(false);
    }
  };

  // Initial Load based on the active section
  useEffect(() => {
    if (showHelp) {
      setLoading(true);
      loadScenarios()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else if (showGrammar) {
      setLoading(true);
      loadGrammarTopics()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else if (showVocabulary) {
      setLoading(true);
      loadVocabularyLessons()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, [showHelp, showGrammar, showVocabulary]);

  // Handle Scenario Click and Fetch Conversation
  const handleScenarioClick = async (scenario) => {
    setLoading(true);
    try {
      const result = await fetchScenarioDetails(scenario);
      const formattedDetails = await formatScenarioDetails(result);
      setScenarioDetails(formattedDetails);
      setSelectedScenario(scenario);
      // Close sidebar on mobile after selecting a scenario
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error fetching scenario details:", error);
      // Optionally, display an error message to the user
      alert("Failed to load conversation details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Grammar Topic Click and Fetch Details
  const handleGrammarClick = async (topic) => {
    setLoading(true);
    try {
      const result = await fetchGrammarDetails(topic);
      const formattedDetails = await formatGrammarDetails(result);
      setGrammarDetails(formattedDetails);
      setSelectedGrammar(topic);
      // Close sidebar on mobile after selecting a grammar topic
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error fetching grammar details:", error);
      alert("Failed to load grammar details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Lesson Click and Fetch Lesson Content
  const handleLessonClick = async (lesson) => {
    setLoading(true);
    try {
      // Example content; replace with actual content or API calls
      const content = `This is the content for the lesson: "${lesson.title}". Here you will learn various aspects related to ${lesson.description.toLowerCase()}.`;

      // Translate the content to Bangla
      const translatedContent = await translateText(content, 'bn'); // Translating to Bangla

      setSelectedLesson(lesson);
      setLessonContent(translatedContent);
      // Close sidebar on mobile after selecting a lesson
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      alert("Failed to load lesson content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh Scenarios
  const refreshScenarios = () => {
    setScenarios([]);
    setSelectedScenario(null);
    setScenarioDetails([]);
    setHasMoreScenarios(true);
    loadScenarios();
  };

  // Refresh Grammar Topics
  const refreshGrammarTopics = () => {
    setGrammarTopics([]);
    setSelectedGrammar(null);
    setGrammarDetails([]);
    setHasMoreGrammar(true);
    loadGrammarTopics();
  };

  // Refresh Vocabulary Lessons
  const refreshVocabularyLessons = () => {
    setVocabularyLessons([]);
    setSelectedLesson(null);
    setLessonContent(null);
    setHasMoreVocabulary(true);
    loadVocabularyLessons();
  };

  // Send Message to Cohere API and Update State
  const sendMessage = async () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setLoading(true);

      try {
        const response = await fetchScenarioDetails(input);
        // Assuming the bot's response is in English
        const translatedResponse = await translateText(response);
        setMessages((prev) => [...prev, { text: translatedResponse, sender: 'bot' }]);
      } catch (error) {
        console.error("Error in sendMessage:", error);
        setMessages((prev) => [...prev, { text: `Error retrieving response: ${error.message}`, sender: 'bot' }]);
      }

      setInput('');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 p-6 border-r flex flex-col bg-gradient-to-r from-indigo-500 to-purple-600 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:static md:translate-x-0`}
      >
        {/* Close button for mobile sidebar */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <h2 className="text-2xl font-bold">EnglishMate</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white focus:outline-none"
            aria-label="Close Sidebar"
          >
            {/* Close Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Sidebar Content */}
        <ul className="flex-1 space-y-6">
          <li 
            className={`cursor-pointer p-3 rounded-md flex items-center ${showHelp ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            onClick={() => {
              setShowHelp(true);
              setShowGrammar(false);
              setShowVocabulary(false);
              setSelectedScenario(null);
              setScenarioDetails([]);
              setSelectedGrammar(null);
              setGrammarDetails([]);
              setSelectedLesson(null);
              setLessonContent(null);
            }}
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            10-Minute English Help
          </li>
          <li 
            className={`cursor-pointer p-3 rounded-md flex items-center ${showGrammar ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            onClick={() => {
              setShowHelp(false);
              setShowGrammar(true);
              setShowVocabulary(false);
              setSelectedScenario(null);
              setScenarioDetails([]);
              setSelectedGrammar(null);
              setGrammarDetails([]);
              setSelectedLesson(null);
              setLessonContent(null);
              setIsSidebarOpen(false); // Close sidebar on mobile
            }}
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Grammar Basics
          </li>
          <li 
            className={`cursor-pointer p-3 rounded-md flex items-center ${showVocabulary ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            onClick={() => {
              setShowHelp(false);
              setShowGrammar(false);
              setShowVocabulary(true);
              setSelectedScenario(null);
              setScenarioDetails([]);
              setSelectedGrammar(null);
              setGrammarDetails([]);
              setSelectedLesson(null);
              setLessonContent(null);
              setIsSidebarOpen(false); // Close sidebar on mobile
            }}
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v-4h8v4m-8 4h8m-8-8h8M4 4h16v16H4V4z" />
            </svg>
            Vocabulary Lessons
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col shadow-lg overflow-auto">
        {/* Header with Hamburger Menu for Mobile */}
        <div className="flex items-center justify-between p-4 bg-purple-700 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white focus:outline-none"
            aria-label="Open Sidebar"
          >
            {/* Hamburger Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">EnglishMate</h2>
          {/* Placeholder for alignment */}
          <div></div>
        </div>

        {/* Conditional Rendering for Help, Grammar Basics, Vocabulary Lessons, and Chat Interface */}
        {showHelp && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold">10-Minute English Help</h2>
              <button
                onClick={refreshScenarios}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8h8" />
                  </svg>
                )}
                Refresh
              </button>
            </div>

            <InfiniteScroll
              dataLength={scenarios.length}
              next={loadScenarios}
              hasMore={hasMoreScenarios}
              loader={
                <div className="flex justify-center items-center my-4">
                  <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500 mt-4">
                  <b>Yay! You have seen all scenarios.</b>
                </p>
              }
            >
              {!selectedScenario ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {scenarios.map((scenario, index) => (
                    <div
                      key={index}
                      className="cursor-pointer p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
                      onClick={() => handleScenarioClick(scenario)}
                    >
                      <svg className="w-12 h-12 mb-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m7-6h6m-6 4h6m-6-8h6M4 4h16v16H4V4z" />
                      </svg>
                      <p className="text-center text-lg font-medium text-gray-700">{scenario}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <button
                    className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md flex items-center hover:bg-purple-700 transition-colors"
                    onClick={() => setSelectedScenario(null)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Scenarios
                  </button>

                  <h3 className="text-2xl font-semibold mb-4">Conversation for: {selectedScenario}</h3>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xl font-semibold mb-2 text-purple-600">English</h4>
                        <ul className="space-y-4">
                          {scenarioDetails.map((line, index) => (
                            <li key={index} className="p-4 bg-gray-100 rounded-md">
                              <p>{line.english}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-2 text-indigo-600">বাংলা</h4>
                        <ul className="space-y-4">
                          {scenarioDetails.map((line, index) => (
                            <li key={index} className="p-4 bg-gray-100 rounded-md">
                              <p>{line.bangla}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </InfiniteScroll>
          </div>
        )}

        {showGrammar && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold">Grammar Basics</h2>
              <button
                onClick={refreshGrammarTopics}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8h8" />
                  </svg>
                )}
                Refresh
              </button>
            </div>

            <InfiniteScroll
              dataLength={grammarTopics.length}
              next={loadGrammarTopics}
              hasMore={hasMoreGrammar}
              loader={
                <div className="flex justify-center items-center my-4">
                  <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500 mt-4">
                  <b>Yay! You have seen all grammar topics.</b>
                </p>
              }
            >
              {!selectedGrammar ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {grammarTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="cursor-pointer p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
                      onClick={() => handleGrammarClick(topic)}
                    >
                      <svg className="w-12 h-12 mb-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-center text-lg font-medium text-gray-700">{topic}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <button
                    className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md flex items-center hover:bg-purple-700 transition-colors"
                    onClick={() => setSelectedGrammar(null)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Grammar Topics
                  </button>

                  <h3 className="text-2xl font-semibold mb-4">Details for: {selectedGrammar}</h3>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xl font-semibold mb-2 text-purple-600">English Explanation</h4>
                        <ul className="space-y-4">
                          {grammarDetails.map((paragraph, index) => (
                            <li key={index} className="p-4 bg-gray-100 rounded-md">
                              <p>{paragraph.english}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-2 text-indigo-600">বাংলা অনুবাদ</h4>
                        <ul className="space-y-4">
                          {grammarDetails.map((paragraph, index) => (
                            <li key={index} className="p-4 bg-gray-100 rounded-md">
                              <p>{paragraph.bangla}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </InfiniteScroll>
          </div>
        )}

        {showVocabulary && (
          selectedLesson ? (
            // Selected Lesson Content
            <div className="p-6">
              <button
                className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md flex items-center hover:bg-purple-700 transition-colors"
                onClick={() => {
                  setSelectedLesson(null);
                  setLessonContent(null);
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Lessons
              </button>
              <h3 className="text-2xl font-semibold mb-4">{selectedLesson.title}</h3>
              {/* Display lesson content */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xl font-semibold mb-2 text-purple-600">English</h4>
                    <p>{`Lesson Content: ${selectedLesson.description}`}</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2 text-indigo-600">বাংলা</h4>
                    <p>{lessonContent}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Vocabulary Lessons List
            <div className="p-6">
              <h2 className="text-3xl font-semibold mb-6">Vocabulary Lessons</h2>
              {loading ? (
                <div className="flex justify-center items-center my-4">
                  <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={vocabularyLessons.length}
                  next={loadVocabularyLessons}
                  hasMore={hasMoreVocabulary}
                  loader={
                    <div className="flex justify-center items-center my-4">
                      <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    </div>
                  }
                  endMessage={
                    <p className="text-center text-gray-500 mt-4">
                      <b>Yay! You have seen all vocabulary lessons.</b>
                    </p>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {vocabularyLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="cursor-pointer p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                        onClick={() => handleLessonClick(lesson)}
                      >
                        <h4 className="text-xl font-semibold mb-2 text-purple-600">{lesson.title}</h4>
                        <p className="text-gray-700">{lesson.description}</p>
                      </div>
                    ))}
                  </div>
                </InfiniteScroll>
              )}
            </div>
          )
        )}

        {/* Chat Interface */}
        {!showHelp && !showGrammar && !showVocabulary && (
          <>
            {/* Chat Header */}
            <div className="bg-purple-700 p-6 text-white flex items-center shadow-lg">
              <input
                type="text"
                placeholder="Type your English query here"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="w-full p-3 rounded-full border-none outline-none text-gray-800"
              />
            </div>

            {/* Chat History */}
            <div className="flex-1 p-6 overflow-y-auto bg-white space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-lg max-w-md ${message.sender === 'user' ? 'bg-purple-100 text-gray-800' : 'bg-gray-200 text-gray-800'}`}>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-gray-100 border-t flex items-center">
              <input
                type="text"
                placeholder="Type a new message..."
                className="flex-1 p-3 border border-gray-300 rounded-full outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="ml-4 px-6 py-3 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right Panel (Clickable, Visible on desktop) */}
      <div
        onClick={() => window.location.href = '/user2.html'}
        className="hidden md:block md:w-64 p-6 border-l bg-gray-200 shadow-lg md:order-3 cursor-pointer hover:bg-gray-300 transition-colors"
      >
        <div className="text-center">
          <img src="https://i.ibb.co/frrrVpd/tutor.png" alt="Chatbot" className="w-24 h-24 rounded-full mx-auto mb-6" />
          <h3 className="text-2xl font-semibold mb-2">EnglishMate AI Chatbot</h3>
          <p className="text-gray-600">Active now</p>
        </div>
        <div className="mt-8 text-sm text-gray-700 space-y-2">
          <p><strong>Position:</strong> English Language Tutor</p>
          <p>
            <strong>Email:</strong>{' '}
            <a
              href="mailto:contact@englishmate.co"
              className="text-indigo-600 hover:underline"
              onClick={(e) => e.stopPropagation()} // Prevents the div's onClick when clicking the email link
            >
              contact@englishmate.co
            </a>
          </p>
          <p><strong>Local time:</strong> 11:58 AM</p>
        </div>
      </div>
    </div>
  );
}
