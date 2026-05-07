// Vercel Serverless Function: AI-анализ через OpenRouter.
// При ошибке возвращает структурированный JSON, чтобы клиент мог показать
// человеческое сообщение и при необходимости включить локальный фоллбэк.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data } = req.body || {};

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'config',
      message: 'OPENROUTER_API_KEY не задан в переменных окружения Vercel',
    });
  }

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
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (networkErr) {
    console.error('OpenRouter network error:', networkErr);
    return res.status(502).json({
      error: 'network',
      message: 'Не удалось соединиться с OpenRouter API',
      details: String(networkErr && networkErr.message || networkErr),
    });
  }

  // Проверяем HTTP-статус ДО парсинга
  if (!response.ok) {
    let body;
    try { body = await response.json(); } catch { body = await response.text().catch(() => ''); }
    console.error('OpenRouter error:', response.status, body);

    // Маппинг статусов на понятные пользователю сообщения
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

  // Ответ получен — пробуем разобрать
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

  // Очищаем от возможных ```json fences и парсим
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
