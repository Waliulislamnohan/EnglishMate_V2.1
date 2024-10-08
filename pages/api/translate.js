// pages/api/translate.js

export default async function handler(req, res) {
  console.log('Received translation request:', req.method, req.url);

  if (req.method !== 'POST') {
    console.warn('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    console.warn('Missing parameters:', { text, targetLang });
    return res.status(400).json({ error: 'Missing parameters: text and targetLang are required.' });
  }

  console.log('Translating text:', text, 'to:', targetLang);

  // MyMemory Translation API Endpoint
  const MYMEMORY_TRANSLATE_URL = 'https://api.mymemory.translated.net/get';

  try {
    const response = await fetch(
      `${MYMEMORY_TRANSLATE_URL}?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(targetLang)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log('MyMemory API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MyMemory API error:', errorData);
      return res.status(response.status).json({ error: `Translation API error: ${response.statusText}` });
    }

    const data = await response.json();
    console.log('Translated text:', data.responseData.translatedText);

    if (!data.responseData || !data.responseData.translatedText) {
      console.error('Unexpected response format:', data);
      return res.status(500).json({ error: 'Unexpected translation response format.' });
    }

    return res.status(200).json({ translatedText: data.responseData.translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Translation failed due to server error.' });
  }
}
