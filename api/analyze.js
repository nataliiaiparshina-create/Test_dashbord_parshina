// Vercel Serverless Function: AI-анализ через OpenRouter.
// Поддерживает два режима:
// 1) Стандартная диагностика — body: { data }
// 2) Q&A — body: { data, userQuestion } → AI отвечает на конкретный вопрос

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, userQuestion } = req.body || {};

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'config',
      message: 'OPENROUTER_API_KEY не задан в переменных окружения Vercel',
    });
  }

  // Промпт зависит от режима
  let prompt;
  if (userQuestion) {
    prompt = `Ты AI-аналитик OEE для фармацевтической компании PharmaLine.
Вот сводные данные производства за выбранный период: ${JSON.stringify(data)}

Пользователь спрашивает: "${userQuestion}"

Ответь конкретно и по делу, на русском, опираясь на цифры из данных. Не более 4 предложений. Если для ответа недостаточно данных — скажи прямо. Не используй markdown, отвечай простым текстом.`;
  } else {
    prompt = `Ты AI-аналитик OEE для фармацевтической компании PharmaLine.
Проанализируй данные производства и верни ТОЛЬКО валидный JSON без markdown.

Данные: ${JSON.stringify(data)}

Верни JSON строго в этом формате:
{
  "anomalies": [{"line": "...", "shift": "...", "date": "...", "description": "...", "cause": "..."}],
  "bottlenecks": [{"cause": "...", "effect": "...", "recommendation": "..."}],
  "priorities": [{"rank": 1, "action": "...", "expected_oee_gain": "...", "gmp_risk": "низкий/средний/высокий"}],
  "summary": "..."
}`;
  }

  let response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        max_tokens: userQuestion ? 500 : 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (networkErr) {
    console.error('OpenRouter network error:', networkErr);
    return res.status(502).json({
      error: 'network',
      message: 'Не удалось соединиться с OpenRouter API',
      details: String((networkErr && networkErr.message) || networkErr),
    });
  }

  if (!response.ok) {
    let body;
    try { body = await response.json(); } catch { body = await response.text().catch(() => ''); }
    console.error('OpenRouter error:', response.status, body);

    const statusMessages = {
      401: 'Недействительный токен OpenRouter',
      402: 'Закончились кредиты OpenRouter — пополните баланс',
      403: 'Доступ запрещён — проверьте права токена',
      404: 'Модель не найдена',
      429: 'Превышен лимит запросов OpenRouter — попробуйте через минуту',
      500: 'Ошибка на стороне OpenRouter',
      502: 'OpenRouter временно недоступен',
      503: 'Сервис OpenRouter перегружен',
    };
    return res.status(response.status).json({
      error: 'upstream',
      status: response.status,
      message: statusMessages[response.status] || `OpenRouter вернул ошибку ${response.status}`,
      details: typeof body === 'string' ? body.slice(0, 300) : (body && body.error && body.error.message) || JSON.stringify(body).slice(0, 300),
    });
  }

  let result;
  try {
    result = await response.json();
  } catch (parseErr) {
    return res.status(502).json({ error: 'invalid_response', message: 'OpenRouter вернул некорректный JSON' });
  }

  const text = result && result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content;
  if (!text) {
    console.error('OpenRouter empty response:', result);
    return res.status(502).json({
      error: 'empty_response',
      message: 'AI вернул пустой ответ',
      details: JSON.stringify(result).slice(0, 300),
    });
  }

  // Q&A режим — возвращаем текст
  if (userQuestion) {
    return res.status(200).json({ answer: text.trim() });
  }

  // Диагностика — парсим JSON
  const clean = text.replace(/```json|```/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (parseErr) {
    console.error('AI returned non-JSON:', clean.slice(0, 200));
    return res.status(502).json({
      error: 'invalid_ai_json',
      message: 'AI вернул ответ не в формате JSON',
      details: clean.slice(0, 300),
    });
  }

  return res.status(200).json(parsed);
}
