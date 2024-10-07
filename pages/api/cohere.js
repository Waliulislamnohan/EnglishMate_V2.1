// pages/api/cohere.js

import axios from 'axios';

export default async function handler(req, res) {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://api.cohere.ai/generate',
      {
        prompt: prompt,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if the response contains 'text' directly
    if (response.data && response.data.text) {
      const result = response.data.text;
      res.status(200).json({ text: result });
    } else {
      console.error('Cohere API returned no valid text:', response.data);
      res.status(500).json({ error: 'Invalid response from Cohere API' });
    }
  } catch (error) {
    console.error('Cohere API error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch Cohere response' });
  }
}
