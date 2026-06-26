export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { service, birth, question } = req.body;
  if (!question) return res.status(400).json({ error: '질문을 입력해주세요' });

  const isSaju = service === 'saju' || service === 'package';
  const prompt = isSaju
    ? `당신은 사주 전문가입니다. 생년월일: ${birth || '미입력'}. 질문: ${question}. 따뜻하고 신비롭게 300자 내외로 사주 분석과 조언을 해주세요.`
    : `당신은 타로 리더입니다. 질문: ${question}. 카드명을 먼저 밝히고 300자 내외로 따뜻하게 해석과 조언을 해주세요.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || '답변 없음';
    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
