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
  
  const renderRecommendationCard = (rec: RecommendationItem, label: string, isA: boolean) => (
    <div className="card-premium p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{label}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isA ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
        }`}>
          Style {isA ? 'A' : 'B'}
        </span>
      </div>
      <p className="text-gray-600 mb-6 italic">{rec.summary}</p>
      
      <div className="space-y-4 flex-grow">
        {rec.outer !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Outerwear</span>
            <p className="text-gray-700 mt-1">{rec.outer}</p>
          </div>
        )}
        {rec.top !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Top</span>
            <p className="text-gray-700 mt-1">{rec.top}</p>
          </div>
        )}
        {rec.bottom !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Bottom</span>
            <p className="text-gray-700 mt-1">{rec.bottom}</p>
          </div>
        )}
        {rec.shoes !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Footwear</span>
            <p className="text-gray-700 mt-1">{rec.shoes}</p>
          </div>
        )}
        {rec.bag !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Bag</span>
            <p className="text-gray-700 mt-1">{rec.bag}</p>
          </div>
        )}
        {rec.belt !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Belt</span>
            <p className="text-gray-700 mt-1">{rec.belt}</p>
          </div>
        )}
        {rec.hat !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Headwear</span>
            <p className="text-gray-700 mt-1">{rec.hat}</p>
          </div>
        )}
        {rec.jewelry !== '해당 없음' && (
          <div className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Jewelry</span>
            <p className="text-gray-700 mt-1">{rec.jewelry}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold gradient-text mb-2">Your AI Style Recommendations</h2>
          <p className="text-gray-600">Curated outfits tailored to your preferences</p>
        </div>
        
        {weather && (
          <div className="text-center mb-8 animate-scale-in">
            <div className="inline-block p-4 glass rounded-xl">
              <p className="text-gray-900 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="font-medium">Weather Forecast:</span> {weather}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Style recommendations optimized for your weather conditions
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="animate-scale-in">
            {renderRecommendationCard(currentRecommendation.recommendation_A, 'Outfit Option A', true)}
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            {renderRecommendationCard(currentRecommendation.recommendation_B, 'Outfit Option B', false)}
          </div>
        </div>
        
        <div className="card-premium p-8 mb-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xl font-semibold mb-4">Select Your Preferred Styles</h3>
          <p className="text-gray-600 mb-6">
            Choose one or both outfits to add to your wardrobe
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center p-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all cursor-pointer group">
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
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="ml-3 font-medium group-hover:text-gray-900">Select Style A</span>
            </label>
            <label className="flex items-center p-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all cursor-pointer group">
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
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="ml-3 font-medium group-hover:text-gray-900">Select Style B</span>
            </label>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={handleAddToDressingRoom}
              disabled={loading || selectedOptions.size === 0}
              className="btn-primary px-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to My Wardrobe
            </button>
          </div>
        </div>
        
        <div className="card-premium p-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-xl font-semibold mb-4">Request Another Recommendation</h3>
          <p className="text-gray-600 mb-6">
            Want something different? Let us know what you'd like to change
          </p>
          <div className="space-y-4">
            <div>
              <label className="label">Adjustments or Special Requests</label>
              <textarea
                className="input-field min-h-[100px] resize-none"
                value={considering}
                onChange={(e) => setConsidering(e.target.value)}
                placeholder="E.g., 'Brighter colors', 'More formal', 'I don't have a black belt'..."
              />
            </div>
            <button
              onClick={handleAnotherRecommendation}
              disabled={loading}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Get Another Recommendation
            </button>
          </div>
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