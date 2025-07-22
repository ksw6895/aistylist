import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { APIResponse } from '@/lib/api-response';
import { z } from 'zod';
import { env } from '@/lib/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Input validation schema
const analyzeTextSchema = z.object({
  text: z.string(),
  selectedItems: z.array(z.any()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = analyzeTextSchema.safeParse(body);
    if (!validationResult.success) {
      return APIResponse.badRequest('Invalid request data', validationResult.error.issues);
    }
    
    const { text, selectedItems } = validationResult.data;
    
    if (!text) {
      return APIResponse.success({ missingCategories: [] }, 'No text to analyze');
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
      return APIResponse.success({ missingCategories: [] }, 'No JSON found in response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return APIResponse.success(analysis, 'Text analyzed successfully');
  } catch (error) {
    console.error('Text analysis error:', error);
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return APIResponse.error('AI service rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }
    
    // Return empty array as fallback for backward compatibility
    return APIResponse.success({ missingCategories: [] }, 'Analysis failed, returning default');
  }
}