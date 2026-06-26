export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { service, birth, question } = req.body;

  if (!question) {
    return res.status(400).json({ error: '질문을 입력해주세요' });
  }

  const isSaju = service === 'saju' || service === 'package';
  const prompt = isSaju
    ? `당신은 사주와 타로 전문가입니다. 다음 정보로 사주 분석과 운세를 한국어로 따뜻하고 신비롭게 해석해주세요. 생년월일: ${birth || '미입력'}. 질문: ${question}. 300자 내외로 핵심만 전달하되, 구체적이고 위로가 되는 메시지로 마무리해주세요.`
    : `당신은 타로 리더입니다. 다음 질문에 타로카드 한 장을 뽑아 신비롭고 따뜻하게 해석해주세요. 질문: ${question}. 카드명을 먼저 밝히고, 300자 내외로 핵심 메시지와 조언을 전달해주세요.`;

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
    const text = data.content?.map(b => b.text || '').join('') || '답변을 가져오지 못했습니다.';
    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: '분석 중 오류가 발생했습니다. 다시 시도해주세요.' });
  }
}
