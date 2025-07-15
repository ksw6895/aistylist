import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { text, selectedItems } = await request.json();
    
    if (!text) {
      return NextResponse.json({ missingCategories: [] });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `다음 텍스트를 분석하여 사용자가 없다고 표현하거나 제외하고 싶어하는 패션 아이템의 카테고리를 찾아주세요.

텍스트: "${text}"

선택된 아이템들:
${JSON.stringify(selectedItems, null, 2)}

카테고리 목록: outer, top, bottom, shoes, bag, belt, hat, jewelry

사용자가 없다고 표현한 아이템이 어떤 카테고리에 속하는지 판단하여 해당 카테고리명을 배열로 반환해주세요.
예시 표현: "없어", "없는데", "빼고", "제외", "없습니다", "가지고 있지 않아", "빼주세요" 등

반드시 JSON 형식으로만 응답하세요:
{
  "missingCategories": ["카테고리1", "카테고리2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ missingCategories: [] });
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Text analysis error:', error);
    return NextResponse.json({ missingCategories: [] });
  }
}