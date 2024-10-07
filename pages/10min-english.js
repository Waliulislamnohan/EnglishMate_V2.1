// pages/10min-english.js
import React, { useState } from 'react';

const scenarios = [
  {
    title: 'At a Restaurant',
    phrases: [
      { english: "Can I see the menu?", translation: "هل يمكنني رؤية القائمة؟" },
      { english: "I would like to order...", translation: "أود أن أطلب..." },
    ],
    audio: ["/audio/menu.mp3", "/audio/order.mp3"], // example audio files
  },
  {
    title: 'Asking for Directions',
    phrases: [
      { english: "Where is the nearest bus stop?", translation: "أين هو أقرب موقف للحافلات؟" },
      { english: "How do I get to the airport?", translation: "كيف أصل إلى المطار؟" },
    ],
    audio: ["/audio/bus-stop.mp3", "/audio/airport.mp3"], // example audio files
  },
  // Add more scenarios
];

export default function TenMinEnglish() {
  const [selectedScenario, setSelectedScenario] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">10-Minute English Help</h1>
      <div className="flex">
        {/* Sidebar with Scenarios */}
        <div className="w-1/3">
          <ul className="space-y-4">
            {scenarios.map((scenario, index) => (
              <li
                key={index}
                onClick={() => setSelectedScenario(scenario)}
                className="cursor-pointer p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200"
              >
                {scenario.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Scenario Display */}
        <div className="w-2/3 ml-8">
          {selectedScenario ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">{selectedScenario.title}</h2>
              <ul className="space-y-4">
                {selectedScenario.phrases.map((phrase, index) => (
                  <li key={index} className="flex items-center">
                    <div className="mr-4">
                      <p className="font-semibold">{phrase.english}</p>
                      <p className="text-gray-600">{phrase.translation}</p>
                    </div>
                    <button className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-full"
                            onClick={() => new Audio(selectedScenario.audio[index]).play()}>
                      🔊 Listen
                    </button>
                  </li>
                ))}
              </ul>
              <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full">
                Practice with Chatbot
              </button>
            </div>
          ) : (
            <p>Please select a scenario to learn.</p>
          )}
        </div>
      </div>
    </div>
  );
}
