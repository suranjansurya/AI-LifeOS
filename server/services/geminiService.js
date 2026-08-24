import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10 && !key.includes('YOUR_KEY_HERE'));
};

export const callGeminiAPI = async (systemPrompt, userPrompt, jsonFormat = false) => {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY_MISSING: Gemini API key is not configured on server.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = `${GEMINI_API_URL}?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\nUser Request: ${userPrompt}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000,
      responseMimeType: jsonFormat ? 'application/json' : 'text/plain'
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[geminiService] HTTP Error ${response.status}:`, errText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty text content received from Gemini API');
    }

    return rawText;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI_TIMEOUT: Gemini API request timed out');
    }
    throw err;
  }
};
