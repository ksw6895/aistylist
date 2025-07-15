'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';

interface HistoryItem {
  id: string;
  requestInfo: any;
  weather: string | null;
  recommendationA: any;
  recommendationB: any;
  selectedOptions: string[];
  createdAt: string;
}

export default function HistoryPage() {
  const { userId } = useApp();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/recommendations/history?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">추천 히스토리</h1>
        
        {history.length === 0 ? (
          <div className="text-center text-gray-600">
            아직 추천 이력이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')} 추천
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      날짜: {item.requestInfo.context?.date || '미지정'} | 
                      지역: {item.requestInfo.context?.location || '미지정'} | 
                      TPO: {item.requestInfo.request?.tpo || '미지정'}
                    </p>
                    {item.weather && (
                      <p className="text-sm text-blue-600 mt-1">
                        날씨: {item.weather}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="text-primary-500 hover:text-primary-600 text-sm"
                  >
                    {expandedId === item.id ? '접기' : '자세히 보기'}
                  </button>
                </div>
                
                <div className="flex gap-2 mb-2">
                  {item.selectedOptions.includes('A') && (
                    <span className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm">
                      착장 A 선택됨
                    </span>
                  )}
                  {item.selectedOptions.includes('B') && (
                    <span className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm">
                      착장 B 선택됨
                    </span>
                  )}
                  {item.selectedOptions.length === 0 && (
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      선택하지 않음
                    </span>
                  )}
                </div>
                
                {expandedId === item.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">착장 A: {item.recommendationA.summary}</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(item.recommendationA)
                            .filter(([key, value]) => key !== 'summary' && value !== '해당 없음')
                            .map(([key, value]) => (
                              <div key={key} className="ml-2">
                                • {key}: {value as string}
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">착장 B: {item.recommendationB.summary}</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(item.recommendationB)
                            .filter(([key, value]) => key !== 'summary' && value !== '해당 없음')
                            .map(([key, value]) => (
                              <div key={key} className="ml-2">
                                • {key}: {value as string}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}