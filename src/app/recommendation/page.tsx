'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
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
  
  const [selectedOptions, setSelectedOptions] = useState<Set<'A' | 'B'>>(new Set());
  const [considering, setConsidering] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; items?: CategoryItem[]; type?: 'success' | 'error' | 'info' } | null>(null);
  const [weather, setWeather] = useState<string>('');

  useEffect(() => {
    if (!currentRecommendation) {
      router.push('/');
    } else {
      // Get weather from localStorage
      const weatherInfo = localStorage.getItem('lastWeather');
      if (weatherInfo) {
        setWeather(weatherInfo);
      }
    }
  }, [currentRecommendation, router]);
  
  useEffect(() => {
    // Save to history when recommendation is loaded (only once)
    if (currentRecommendation && userId && !localStorage.getItem('historySaved')) {
      saveToHistory();
      localStorage.setItem('historySaved', 'true');
    }
  }, [currentRecommendation, userId]);
  
  const saveToHistory = async () => {
    if (!userId || !currentRecommendation) return;
    
    try {
      const requestInfo = {
        userInfo,
        context: {
          date: localStorage.getItem('lastDate') || new Date().toISOString().split('T')[0],
          location: localStorage.getItem('lastLocation') || '',
        },
        request: {
          item: localStorage.getItem('lastItem') || '',
          tpo: localStorage.getItem('lastTPO') || '',
          mood: localStorage.getItem('lastMood') || '',
        }
      };
      
      await fetch('/api/recommendations/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requestInfo,
          weather,
          recommendationA: currentRecommendation.recommendation_A,
          recommendationB: currentRecommendation.recommendation_B,
          selectedOptions: Array.from(selectedOptions),
        }),
      });
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  if (!currentRecommendation) {
    return null;
  }

  const analyzeConsideringText = async (text: string, selectedItems: any): Promise<string[]> => {
    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, selectedItems }),
      });
      
      const data = await response.json();
      return data.missingCategories || [];
    } catch (error) {
      console.error('Error analyzing text:', error);
      return [];
    }
  };
  
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
    if (!userId || selectedOptions.size === 0) {
      setToast({ message: '착장을 선택해주세요.', type: 'error' });
      return;
    }
    
    setLoading(true);
    const items: CategoryItem[] = [];
    const categories = ['outer', 'top', 'bottom', 'shoes', 'bag', 'belt', 'hat', 'jewelry'];
    const groupId = new Date().getTime().toString();
    const tpo = localStorage.getItem('lastTPO') || '';
    const mood = localStorage.getItem('lastMood') || '';
    const date = localStorage.getItem('lastDate') || new Date().toISOString().split('T')[0];
    const groupName = `${mood} ${tpo}`.trim() || '스타일 추천';
    
    selectedOptions.forEach(option => {
      const selectedRec = option === 'A' 
        ? currentRecommendation.recommendation_A 
        : currentRecommendation.recommendation_B;
      
      categories.forEach(category => {
        const value = selectedRec[category as keyof RecommendationItem];
        if (value && value !== '해당 없음' && category !== 'summary') {
          // Check if item already exists to avoid duplicates
          const exists = items.some(item => 
            item.category === category && item.description === value
          );
          if (!exists) {
            items.push({ 
              category, 
              description: value as string,
              groupId,
              groupName,
              groupDate: date,
              groupWeather: weather || '',
              groupTPO: tpo
            });
          }
        }
      });
    });

    try {
      await fetch('/api/dressing-room/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items }),
      });
      
      // Update history with selected options
      await updateHistorySelection();
      
      setToast({ 
        message: '드레싱룸에 추가되었습니다!', 
        items: items,
        type: 'success' 
      });
      setTimeout(() => router.push('/dressing-room'), 2000);
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: '추가 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnotherRecommendation = async () => {
    setLoading(true);
    
    if (selectedOptions.size > 0 && considering.trim()) {
      // Get all selected items
      const selectedItems: any = {};
      selectedOptions.forEach(option => {
        const rec = option === 'A' 
          ? currentRecommendation.recommendation_A 
          : currentRecommendation.recommendation_B;
        selectedItems[option] = rec;
      });
      
      // Analyze considering text using AI
      const missingCategories = await analyzeConsideringText(considering, selectedItems);
      
      if (missingCategories.length > 0) {
        const dressingRoomItems: CategoryItem[] = [];
        const shoppingListItems: CategoryItem[] = [];
        const allCategories = ['outer', 'top', 'bottom', 'shoes', 'bag', 'belt', 'hat', 'jewelry'];
        const groupId = new Date().getTime().toString();
        const tpo = localStorage.getItem('lastTPO') || '';
        const mood = localStorage.getItem('lastMood') || '';
        const date = localStorage.getItem('lastDate') || new Date().toISOString().split('T')[0];
        const groupName = `${mood} ${tpo}`.trim() || '스타일 추천';
        
        selectedOptions.forEach(option => {
          const selectedRec = option === 'A' 
            ? currentRecommendation.recommendation_A 
            : currentRecommendation.recommendation_B;
          
          allCategories.forEach(category => {
            const value = selectedRec[category as keyof RecommendationItem];
            if (value && value !== '해당 없음' && category !== 'summary') {
              const item = { 
                category, 
                description: value as string,
                groupId,
                groupName,
                groupDate: date,
                groupWeather: weather || '',
                groupTPO: tpo
              };
              
              if (missingCategories.includes(category)) {
                // Check if not already in shopping list
                const exists = shoppingListItems.some(existing => 
                  existing.category === item.category && existing.description === item.description
                );
                if (!exists) {
                  shoppingListItems.push(item);
                }
              } else {
                // Check if not already in dressing room
                const exists = dressingRoomItems.some(existing => 
                  existing.category === item.category && existing.description === item.description
                );
                if (!exists) {
                  dressingRoomItems.push(item);
                }
              }
            }
          });
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
          
          // Update history with selected options
          await updateHistorySelection();
          
          setToast({ 
            message: '요청하신 아이템은 쇼핑 리스트에, 나머지는 내 옷장에 추가되었어요!',
            items: [...shoppingListItems, ...dressingRoomItems],
            type: 'success'
          });
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
      setSelectedOptions(new Set());
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: '추천을 받는 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateHistorySelection = async () => {
    // This will be called when user makes a selection
    // Since we save on load, we just need to update the selected options
    // For now, we'll rely on the initial save
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
        <h2 className="text-3xl font-bold text-center mb-4">AI 스타일 추천 결과</h2>
        
        {weather && (
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700">
                <span className="font-medium">날씨 정보:</span> {weather}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                선택하신 날짜의 날씨를 고려하여 스타일을 추천했습니다
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {renderRecommendationCard(currentRecommendation.recommendation_A, '착장 A')}
          {renderRecommendationCard(currentRecommendation.recommendation_B, '착장 B')}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">착장 선택</h3>
          <p className="text-sm text-gray-600 mb-4">
            원하는 착장을 모두 선택할 수 있습니다 (복수 선택 가능)
          </p>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.has('A')}
                onChange={(e) => {
                  const newOptions = new Set(selectedOptions);
                  if (e.target.checked) {
                    newOptions.add('A');
                  } else {
                    newOptions.delete('A');
                  }
                  setSelectedOptions(newOptions);
                }}
                className="mr-3"
              />
              <span>착장 A 선택</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.has('B')}
                onChange={(e) => {
                  const newOptions = new Set(selectedOptions);
                  if (e.target.checked) {
                    newOptions.add('B');
                  } else {
                    newOptions.delete('B');
                  }
                  setSelectedOptions(newOptions);
                }}
                className="mr-3"
              />
              <span>착장 B 선택</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleAddToDressingRoom}
            disabled={loading || selectedOptions.size === 0}
            className="btn-primary"
          >
            My dressing room에 추가
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">다른 추천 받기</h3>
          <label className="label">개선점이나 요청사항</label>
          <input
            type="text"
            className="input-field mb-4"
            value={considering}
            onChange={(e) => setConsidering(e.target.value)}
            placeholder="예: 좀 더 밝은 색상으로, 검은색 벨트가 없어"
          />
          <button
            onClick={handleAnotherRecommendation}
            disabled={loading}
            className="btn-secondary w-full"
          >
            Another recommendation
          </button>
        </div>
        
      </main>
      
      {toast && (
        <Toast 
          message={toast.message} 
          items={toast.items}
          type={toast.type}
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}