'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { RecommendationItem, CategoryItem } from '@/types';

export default function RecommendationPage() {
  const router = useRouter();
  const { 
    userId,
    currentRecommendation, 
    setCurrentRecommendation,
    addPreviousRecommendation,
    previousRecommendations,
    userInfo,
    
  } = useApp();
  
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'none'>('A');
  const [considering, setConsidering] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentRecommendation) {
      router.push('/');
    }
  }, [currentRecommendation, router]);

  if (!currentRecommendation) {
    return null;
  }

  const parseConsideringText = (text: string): { missingItems: string[], categories: string[] } => {
    const missingKeywords = ['없어', '없는데', '없음', '빼고', '제외'];
    const categories = ['outer', 'top', 'bottom', 'shoes', 'bag', 'belt', 'hat', 'jewelry'];
    
    const missingItems: string[] = [];
    const missingCategories: string[] = [];
    
    // Check for missing items
    missingKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        // Extract the item before the keyword
        const words = text.split(/\s+/);
        const keywordIndex = words.findIndex(word => word.includes(keyword));
        if (keywordIndex > 0) {
          const potentialItems = words.slice(Math.max(0, keywordIndex - 3), keywordIndex).join(' ');
          missingItems.push(potentialItems);
          
          // Try to match categories
          categories.forEach(category => {
            const categoryKeywords: { [key: string]: string[] } = {
              'belt': ['벨트'],
              'shoes': ['신발', '구두', '스니커즈', '운동화', '로퍼', '부츠'],
              'bag': ['가방', '백', '숄더백', '크로스백', '토트백', '백팩'],
              'hat': ['모자', '캡', '비니', '베레모'],
              'jewelry': ['주얼리', '목걸이', '반지', '귀걸이', '팔찌', '시계'],
              'outer': ['아우터', '자켓', '재킷', '코트', '점퍼', '블레이저'],
              'top': ['상의', '티셔츠', '셔츠', '블라우스', '니트'],
              'bottom': ['하의', '바지', '팬츠', '스커트', '청바지', '슬랙스']
            };
            
            if (categoryKeywords[category]?.some(kw => potentialItems.includes(kw))) {
              missingCategories.push(category);
            }
          });
        }
      }
    });
    
    return { missingItems, categories: missingCategories };
  };

  const handleAddToDressingRoom = async () => {
    if (!userId || selectedOption === 'none') return;
    
    setLoading(true);
    const selectedRec = selectedOption === 'A' 
      ? currentRecommendation.recommendation_A 
      : currentRecommendation.recommendation_B;
    
    const items: CategoryItem[] = [];
    const categories = ['outer', 'top', 'bottom', 'shoes', 'bag', 'belt', 'hat', 'jewelry'];
    
    categories.forEach(category => {
      const value = selectedRec[category as keyof RecommendationItem];
      if (value && value !== '해당 없음' && category !== 'summary') {
        items.push({ category, description: value as string });
      }
    });

    try {
      await fetch('/api/dressing-room/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items }),
      });
      
      alert('드레싱룸에 추가되었습니다!');
      router.push('/dressing-room');
    } catch (error) {
      console.error('Error:', error);
      alert('추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnotherRecommendation = async () => {
    setLoading(true);
    
    if (selectedOption !== 'none' && considering.trim()) {
      // Parse considering text for missing items
      const { categories: missingCategories } = parseConsideringText(considering);
      
      if (missingCategories.length > 0) {
        const selectedRec = selectedOption === 'A' 
          ? currentRecommendation.recommendation_A 
          : currentRecommendation.recommendation_B;
        
        const dressingRoomItems: CategoryItem[] = [];
        const shoppingListItems: CategoryItem[] = [];
        
        const allCategories = ['outer', 'top', 'bottom', 'shoes', 'bag', 'belt', 'hat', 'jewelry'];
        
        allCategories.forEach(category => {
          const value = selectedRec[category as keyof RecommendationItem];
          if (value && value !== '해당 없음' && category !== 'summary') {
            if (missingCategories.includes(category)) {
              shoppingListItems.push({ category, description: value as string });
            } else {
              dressingRoomItems.push({ category, description: value as string });
            }
          }
        });
        
        // Add to shopping list and dressing room
        try {
          if (shoppingListItems.length > 0) {
            await fetch('/api/shopping-list/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, items: shoppingListItems }),
            });
          }
          
          if (dressingRoomItems.length > 0) {
            await fetch('/api/dressing-room/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, items: dressingRoomItems }),
            });
          }
          
          alert('요청하신 아이템은 쇼핑 리스트에, 나머지는 내 옷장에 추가되었어요!');
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
    
    // Add current to previous recommendations
    addPreviousRecommendation(currentRecommendation);
    
    // Get new recommendation
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          context: {
            date: new Date().toISOString().split('T')[0],
            location: localStorage.getItem('lastLocation') || '서울',
          },
          request: {
            item: localStorage.getItem('lastItem') || '',
            tpo: localStorage.getItem('lastTPO') || '',
            mood: localStorage.getItem('lastMood') || '',
          },
          previousRecommendations: [...previousRecommendations, currentRecommendation].map(rec => ({
            recommendation_A: { summary: rec.recommendation_A.summary },
            recommendation_B: { summary: rec.recommendation_B.summary }
          })),
          considering: considering.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to get recommendation');

      const data = await response.json();
      setCurrentRecommendation(data);
      setConsidering('');
      setSelectedOption('A');
    } catch (error) {
      console.error('Error:', error);
      alert('추천을 받는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendationCard = (rec: RecommendationItem, label: string) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-gray-600 mb-4">{rec.summary}</p>
      
      <div className="space-y-3">
        {rec.outer !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">아우터: </span>
            <span className="text-gray-600">{rec.outer}</span>
          </div>
        )}
        {rec.top !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">상의: </span>
            <span className="text-gray-600">{rec.top}</span>
          </div>
        )}
        {rec.bottom !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">하의: </span>
            <span className="text-gray-600">{rec.bottom}</span>
          </div>
        )}
        {rec.shoes !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">신발: </span>
            <span className="text-gray-600">{rec.shoes}</span>
          </div>
        )}
        {rec.bag !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">가방: </span>
            <span className="text-gray-600">{rec.bag}</span>
          </div>
        )}
        {rec.belt !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">벨트: </span>
            <span className="text-gray-600">{rec.belt}</span>
          </div>
        )}
        {rec.hat !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">모자: </span>
            <span className="text-gray-600">{rec.hat}</span>
          </div>
        )}
        {rec.jewelry !== '해당 없음' && (
          <div className="border-l-4 border-primary-400 pl-3">
            <span className="font-medium text-gray-700">주얼리: </span>
            <span className="text-gray-600">{rec.jewelry}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">AI 스타일 추천 결과</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {renderRecommendationCard(currentRecommendation.recommendation_A, '착장 A')}
          {renderRecommendationCard(currentRecommendation.recommendation_B, '착장 B')}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">선택하기</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="selection"
                value="A"
                checked={selectedOption === 'A'}
                onChange={() => setSelectedOption('A')}
                className="mr-3"
              />
              <span>착장 A 선택</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="selection"
                value="B"
                checked={selectedOption === 'B'}
                onChange={() => setSelectedOption('B')}
                className="mr-3"
              />
              <span>착장 B 선택</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="selection"
                value="none"
                checked={selectedOption === 'none'}
                onChange={() => setSelectedOption('none')}
                className="mr-3"
              />
              <span>마음에 드는 착장 없음</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="label">Considering</label>
          <input
            type="text"
            className="input-field"
            value={considering}
            onChange={(e) => setConsidering(e.target.value)}
            placeholder="예: 좀 더 밝은 색상으로, 검은색 벨트가 없어"
          />
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={handleAddToDressingRoom}
            disabled={loading || selectedOption === 'none'}
            className="btn-primary"
          >
            My dressing room에 추가
          </button>
          <button
            onClick={handleAnotherRecommendation}
            disabled={loading}
            className="btn-secondary"
          >
            Another recommendation
          </button>
        </div>
      </main>
    </div>
  );
}