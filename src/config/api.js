const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error(
        '⚠️ VITE_GEMINI_API_KEY is not set. Create a .env file in the project root with:\n' +
        'VITE_GEMINI_API_KEY=your_api_key_here'
    );
}

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
export const isApiConfigured = Boolean(API_KEY);
