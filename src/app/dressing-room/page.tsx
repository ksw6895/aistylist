'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';

interface Item {
  id: string;
  category: string;
  itemDescription: string;
  createdAt: string;
  groupId?: string;
  groupName?: string;
  groupDate?: string;
  groupWeather?: string;
  groupTPO?: string;
}

const categoryNames: { [key: string]: string } = {
  outer: '아우터',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  bag: '가방',
  belt: '벨트',
  hat: '모자',
  jewelry: '주얼리',
};

export default function DressingRoomPage() {
  const { userId } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'category' | 'group'>('category');
  const [activeCategory, setActiveCategory] = useState<string>('outer');
  const [groups, setGroups] = useState<{ [key: string]: Item[] }>({});

  useEffect(() => {
    if (userId) {
      fetchItems();
    }
  }, [userId]);

  const fetchItems = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/dressing-room?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      setItems(data);
      
      // Group items by groupId
      const grouped: { [key: string]: Item[] } = {};
      data.forEach((item: Item) => {
        if (item.groupId) {
          if (!grouped[item.groupId]) {
            grouped[item.groupId] = [];
          }
          grouped[item.groupId].push(item);
        }
      });
      setGroups(grouped);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const categories = ['outer', 'top', 'bottom', 'shoes', 'bag', 'belt', 'hat', 'jewelry'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">My Dressing Room</h2>
        
        {/* Tab Selection */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md inline-flex">
            <button
              onClick={() => setActiveTab('category')}
              className={`px-6 py-3 rounded-l-lg font-medium transition-colors ${
                activeTab === 'category'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              카테고리별 보기
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`px-6 py-3 rounded-r-lg font-medium transition-colors ${
                activeTab === 'group'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              추천 묶음별 보기
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          activeTab === 'category' ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex flex-wrap border-b">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {categoryNames[category]}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                {getItemsByCategory(activeCategory).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">아직 {categoryNames[activeCategory]} 카테고리에 저장된 아이템이 없습니다.</p>
                    <p className="mt-2">AI 스타일리스트의 추천을 받아보세요!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getItemsByCategory(activeCategory).map(item => (
                      <div key={item.id} className="border-l-4 border-primary-400 pl-4 py-2">
                        <p className="text-gray-800">{item.itemDescription}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          추가일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groups).length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
                  <p className="text-lg">아직 저장된 추천 묶음이 없습니다.</p>
                  <p className="mt-2">AI 스타일리스트의 추천을 받아보세요!</p>
                </div>
              ) : (
                Object.entries(groups).map(([groupId, groupItems]) => {
                  const firstItem = groupItems[0];
                  return (
                    <div key={groupId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="bg-primary-50 p-4 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {firstItem.groupName || '스타일 추천'}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          {firstItem.groupDate && (
                            <span>날짜: {new Date(firstItem.groupDate).toLocaleDateString('ko-KR')}</span>
                          )}
                          {firstItem.groupWeather && (
                            <span>날씨: {firstItem.groupWeather}</span>
                          )}
                          {firstItem.groupTPO && (
                            <span>TPO: {firstItem.groupTPO}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupItems.map(item => (
                            <div key={item.id} className="border-l-4 border-primary-400 pl-4 py-2">
                              <p className="text-sm font-medium text-gray-600">{categoryNames[item.category]}</p>
                              <p className="text-gray-800">{item.itemDescription}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}