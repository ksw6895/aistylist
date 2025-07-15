'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';

interface Item {
  id: string;
  category: string;
  itemDescription: string;
  createdAt: string;
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

export default function ShoppingListPage() {
  const { userId } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('outer');

  useEffect(() => {
    if (userId) {
      fetchItems();
    }
  }, [userId]);

  const fetchItems = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/shopping-list?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      setItems(data);
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
        <h2 className="text-3xl font-bold text-center mb-8">Shopping Recommendation</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
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
                  <p className="text-lg">{categoryNames[activeCategory]} 카테고리에 쇼핑 추천 아이템이 없습니다.</p>
                  <p className="mt-2">AI 스타일리스트가 추천하는 아이템을 받아보세요!</p>
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
        )}
      </main>
    </div>
  );
}