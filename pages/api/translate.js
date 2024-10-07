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
  
    const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
  
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.error('Google Translate API key not configured.');
      return res.status(500).json({ error: 'Translation service not configured.' });
    }
  
    const googleTranslateUrl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  
    try {
      const response = await fetch(googleTranslateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text',
        }),
      });
  
      console.log('Google Translate API response status:', response.status);
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Google Translate API error:', errorData);
        return res.status(response.status).json({ error: `Translation API error: ${response.statusText}` });
      }
  
      const data = await response.json();
      console.log('Translated text:', data.data.translations[0].translatedText);
  
      if (!data.data || !data.data.translations || !data.data.translations[0].translatedText) {
        console.error('Unexpected response format:', data);
        return res.status(500).json({ error: 'Unexpected translation response format.' });
      }
  
      return res.status(200).json({ translatedText: data.data.translations[0].translatedText });
    } catch (error) {
      console.error('Translation error:', error);
      return res.status(500).json({ error: 'Translation failed due to server error.' });
    }
  }
  