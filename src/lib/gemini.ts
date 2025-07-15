import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecommendRequest, RecommendationResponse } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getStyleRecommendation(
  request: RecommendRequest
): Promise<RecommendationResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const systemPrompt = `당신은 세계 최고의 AI 패션 스타일리스트입니다. 사용자의 정보와 요구사항을 기반으로, 서로 다른 스타일의 두 가지 완벽한 착장을 제안해야 합니다. 각 착장은 아우터, 상의, 하의, 신발, 가방, 벨트, 모자, 주얼리 카테고리로 나누어 구체적인 아이템을 묘사해야 합니다. 불필요한 카테고리는 '해당 없음'으로 표시하세요. 반드시 아래와 같은 JSON 형식으로만 응답해야 합니다.

{
  "recommendation_A": {
    "summary": "스타일 요약 설명",
    "outer": "아우터 설명 또는 해당 없음",
    "top": "상의 설명",
    "bottom": "하의 설명",
    "shoes": "신발 설명",
    "bag": "가방 설명 또는 해당 없음",
    "belt": "벨트 설명 또는 해당 없음",
    "hat": "모자 설명 또는 해당 없음",
    "jewelry": "주얼리 설명 또는 해당 없음"
  },
  "recommendation_B": {
    "summary": "스타일 요약 설명",
    "outer": "아우터 설명 또는 해당 없음",
    "top": "상의 설명",
    "bottom": "하의 설명",
    "shoes": "신발 설명",
    "bag": "가방 설명 또는 해당 없음",
    "belt": "벨트 설명 또는 해당 없음",
    "hat": "모자 설명 또는 해당 없음",
    "jewelry": "주얼리 설명 또는 해당 없음"
  }
}`;

  let userPrompt = `
사용자 정보:
- 나이: ${request.userInfo.age || '미입력'}
- 성별: ${request.userInfo.gender || '미입력'}
- 직업: ${request.userInfo.occupation || '미입력'}

상황:
- 날짜: ${request.context.date}
- 지역: ${request.context.location}
- 날씨: ${request.context.weather || '날씨 정보 없음'}

요청사항:
- 원하는 아이템: ${request.request.item}
- TPO: ${request.request.tpo}
- 원하는 분위기: ${request.request.mood}
`;

  if (request.considering) {
    userPrompt += `\n추가 고려사항: ${request.considering}`;
  }

  if (request.previousRecommendations && request.previousRecommendations.length > 0) {
    const prevSummaries = request.previousRecommendations
      .map((rec, i) => `${i + 1}. A: ${rec.recommendation_A.summary}, B: ${rec.recommendation_B.summary}`)
      .join('\n');
    userPrompt += `\n\n이전 추천과는 다른 스타일로 제안해주세요:\n${prevSummaries}`;
  }

  try {
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const recommendations = JSON.parse(jsonMatch[0]) as RecommendationResponse;
    return recommendations;
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return fallback recommendation
    return {
      recommendation_A: {
        summary: "캐주얼한 데일리 룩",
        outer: "가벼운 데님 재킷",
        top: "화이트 코튼 티셔츠",
        bottom: "스트레이트 진",
        shoes: "화이트 스니커즈",
        bag: "크로스백",
        belt: "해당 없음",
        hat: "해당 없음",
        jewelry: "심플한 시계"
      },
      recommendation_B: {
        summary: "세미 포멀한 오피스 룩",
        outer: "네이비 블레이저",
        top: "라이트 블루 셔츠",
        bottom: "차콜 그레이 슬랙스",
        shoes: "블랙 로퍼",
        bag: "브리프케이스",
        belt: "블랙 가죽 벨트",
        hat: "해당 없음",
        jewelry: "메탈 시계"
      }
    };
  }
}