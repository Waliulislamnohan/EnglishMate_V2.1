// pages/api/gpt.js
import axios from 'axios';

export default async function handler(req, res) {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
      }
    );
    
    const result = response.data.choices[0].text;
    res.status(200).json({ text: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GPT response' });
  }
}
