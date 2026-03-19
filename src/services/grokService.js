// src/services/grokService.js

const GROK_API_KEY = process.env.REACT_APP_GROK_API_KEY;

export async function getGrokRecommendation(biomarkers) {
  try {
    const response = await fetch('/api/grok/v1/chat/completions', {
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [
          {
            role: 'system',
            content: 'You are BioSense AI health advisor. Give one short personalized health tip based on biomarkers. Max 2 sentences. Be friendly and use 1 emoji.'
          },
          {
            role: 'user',
            content: `My biomarkers:
- Heart Rate: ${biomarkers.heartRate} bpm
- Blood Pressure: ${biomarkers.bloodPressure}
- Glucose: ${biomarkers.glucose} mmol/L
- Oxygen: ${biomarkers.oxygen}%
- Steps today: ${biomarkers.steps}
Give me a short health tip.`
          }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('Grok API error:', err);
    return '💡 Stay hydrated and keep moving — your body will thank you!';
  }
}