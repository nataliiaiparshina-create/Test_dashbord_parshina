export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data } = req.body;

  const prompt = `Ты AI-аналитик OEE для фармацевтической компании PharmaLine.
Проанализируй данные производства и верни ТОЛЬКО валидный JSON без markdown.

Данные: ${JSON.stringify(data)}

Верни JSON строго в этом формате:
{
  "anomalies": [{"line": "...", "shift": "...", "date": "...", "description": "...", "cause": "..."}],
  "bottlenecks": [{"cause": "...", "effect": "...", "recommendation": "..."}],
  "priorities": [{"rank": 1, "action": "...", "expected_oee_gain": "...", "gmp_risk": "низкий/средний/высокий"}],
  "summary": "..."
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const result = await response.json();
    const text = result.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
}