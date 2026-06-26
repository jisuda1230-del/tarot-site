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
    prompt = `당신은 30년 경력의 사주 명리학 전문가입니다. 생년월일: ${birth || '미입력'}. 질문: ${q}.

다음 항목을 순서대로 깊이 있게 풀어주세요. 각 항목마다 최소 150자 이상 상세하게 작성하세요.

[사주 기본 분석]
생년월일을 바탕으로 사주팔자의 기본 구조와 타고난 기질, 성향을 분석해주세요.

[올해 전체 운세]
올해의 큰 흐름과 운의 방향성을 설명해주세요.

[연애운 & 인간관계]
올해 연애운과 주요 인간관계의 흐름을 분석해주세요.

[재물운 & 직업운]
올해 재물의 흐름과 직업적 기회 및 주의사항을 알려주세요.

[하반기 집중 운세]
하반기에 특히 주의하거나 기회를 잡아야 할 시기와 내용을 알려주세요.

[조언 & 개운법]
이 사주에 맞는 실질적인 조언과 운을 좋게 하는 방법을 알려주세요.

이모지와 별표(*)는 절대 사용하지 마세요. 따뜻하고 신비로우면서도 구체적인 말투로 작성해주세요. 전체 1500자 이상 작성하세요.`;

  } else if (service === 'package') {
    const q = question || '전체적인 운세';
    prompt = `당신은 사주 명리학과 타로 전문가입니다. 생년월일: ${birth || '미입력'}. 질문: ${q}.

아래 두 파트를 모두 상세하게 작성해주세요.

[사주 분석]
생년월일을 바탕으로 사주팔자 기본 구조, 올해 전체 운세, 연애운, 재물운, 직업운을 각각 100자 이상씩 상세하게 분석해주세요.

[타로 3장 리딩 - 과거 / 현재 / 미래]
질문과 관련된 타로카드 3장을 뽑아주세요.
각 카드마다 카드 이름, 카드의 상징과 의미, 질문자의 상황에 적용한 구체적인 해석, 앞으로의 조언을 200자 이상씩 작성해주세요.
마지막으로 3장을 종합한 전체 메시지를 200자 이상 작성해주세요.

이모지와 별표(*)는 절대 사용하지 마세요. 따뜻하고 신비로우면서도 구체적인 말투로 작성하세요. 전체 2000자 이상 작성하세요.`;

  } else {
    const q = question || '지금 제 상황을 전반적으로 봐주세요';
    prompt = `당신은 20년 경력의 타로 마스터입니다. 질문: ${q}.

아래 순서로 깊이 있는 타로 리딩을 진행해주세요.

[뽑힌 카드]
이 질문에 가장 적합한 타로카드 1장을 선택하고 카드 이름을 밝혀주세요.

[카드의 상징과 의미]
이 카드가 가진 전통적인 상징과 의미를 상세하게 설명해주세요. 최소 200자 이상 작성하세요.

[질문에 대한 해석]
질문자의 구체적인 상황에 이 카드를 적용해서 깊이 있게 해석해주세요. 현재 상황, 숨겨진 에너지, 주변 환경까지 최소 300자 이상 작성하세요.

[앞으로의 흐름]
앞으로 펼쳐질 상황의 흐름과 변화를 구체적으로 알려주세요. 최소 200자 이상 작성하세요.

[조언 & 메시지]
카드가 질문자에게 전하는 핵심 메시지와 실질적인 조언을 따뜻하게 전달해주세요. 최소 200자 이상 작성하세요.

이모지와 별표(*)는 절대 사용하지 마세요. 따뜻하고 신비로우면서도 구체적인 말투로 작성하세요. 전체 1200자 이상 작성하세요.`;
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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    let text = data.content?.map(b => b.text || '').join('') || '답변을 가져오지 못했습니다.';
    text = text.replace(/[\*\_\#]+/g, '').replace(/\*/g, '').replace(/#+\s/g, '').trim();
    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
