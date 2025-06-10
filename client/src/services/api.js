// api.js
const API_BASE_URL =import.meta.env.VITE_CODE_EXECUTION_URL || 'http://localhost:8000';

export const compileAndRun = async (language, code, input = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        code,
        input
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to compile and run code');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};