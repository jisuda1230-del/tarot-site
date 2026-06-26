export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { service, birth, question } = req.body;
  let prompt;

  if (service === 'saju') {
    const q = question || '전체적인 운세';
    prompt = `당신은 30년 경력의 사주 명리학 전문가입니다. 생년월일: ${birth || '미입력'}. 질문: ${q}. 다음 항목을 각각 150자 이상 상세하게 작성하세요. [사주 기본 분석] [올해 전체 운세] [연애운] [재물운 직업운] [하반기 운세] [조언]. 이모지와 별표는 사용하지 마세요. 전체 1500자 이상 작성하세요.`;
  } else if (service === 'package') {
    const q = question || '전체적인 운세';
    prompt = `당신은 사주와 타로 전문가입니다. 생년월일: ${birth || '미입력'}. 질문: ${q}. [사주 분석] 기본구조, 올해운세, 연애운, 재물운을 각 100자 이상 분석하세요. [타로 3장 리딩] 과거/현재/미래 카드 3장을 뽑아 각 카드명, 의미, 해석, 조언을 200자 이상씩 작성하고 종합 메시지 200자 이상 작성하세요. 이모지와 별표는 사용하지 마세요. 전체 2000자 이상 작성하세요.`;
  } else {
    const q = question || '지금 제 상황을 전반적으로 봐주세요';
    prompt = `당신은 20년 경력의 타로 마스터입니다. 질문: ${q}. [뽑힌 카드] 카드명을 밝히세요. [카드의 상징과 의미] 200자 이상. [질문에 대한 해석] 300자 이상. [앞으로의 흐름] 200자 이상. [조언과 메시지] 200자 이상. 이모지와 별표는 사용하지 마세요. 전체 1200자 이상 작성하세요.`;
  }

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    let text = data.content?.map(b => b.text || '').join('') || '답변을 가져오지 못했습니다.';
    text = text.replace(/[\*\_\#]+/g, '').replace(/#+\s/g, '').trim();
    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
