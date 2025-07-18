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
  outer: 'Outerwear',
  top: 'Tops',
  bottom: 'Bottoms',
  shoes: 'Footwear',
  bag: 'Bags',
  belt: 'Belts',
  hat: 'Headwear',
  jewelry: 'Jewelry',
};

const categoryIcons: { [key: string]: JSX.Element } = {
  outer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  top: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-18 0l9-5 9 5" />
    </svg>
  ),
  bottom: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l6 0m-3-9v18" />
    </svg>
  ),
  shoes: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18v-6a9 9 0 0118 0v6m-3 0H6" />
    </svg>
  ),
  bag: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  belt: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16M4 12a8 8 0 018-8m-8 8a8 8 0 018 8m4-8a8 8 0 00-8-8m8 8a8 8 0 01-8 8" />
    </svg>
  ),
  hat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
    </svg>
  ),
  jewelry: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l2 7h7l-5.5 4 2 7L12 15l-5.5 5 2-7L3 9h7l2-7z" />
    </svg>
  ),
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
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-4xl font-bold gradient-text mb-2">Shopping List</h2>
          <p className="text-gray-600">Curated items to complete your wardrobe</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="animate-scale-in">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50">
              <div className="flex flex-wrap gap-2 p-6 bg-gradient-to-r from-gray-50/50 to-gray-100/50 border-b border-gray-200/50">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`group px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeCategory === category
                        ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                        : 'bg-white/70 backdrop-blur text-gray-700 hover:bg-gray-100/70 hover:shadow-md'
                    }`}
                  >
                    <span className={`transition-transform duration-300 ${
                      activeCategory === category ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {categoryIcons[category]}
                    </span>
                    {categoryNames[category]}
                  </button>
                ))}
              </div>
              
              <div className="p-8">
                {getItemsByCategory(activeCategory).length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100/50 backdrop-blur mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-xl font-medium text-gray-900 mb-2">
                      No {categoryNames[activeCategory]} in your shopping list
                    </p>
                    <p className="text-gray-600 max-w-md mx-auto">
                      When you select "I don't have this item" during recommendations, items will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {getItemsByCategory(activeCategory).map((item, index) => (
                      <div 
                        key={item.id} 
                        className="group p-6 rounded-xl bg-white/50 backdrop-blur border border-gray-200/50 hover:bg-white/70 hover:border-gray-300/50 hover:shadow-lg transition-all duration-300 animate-scale-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <p className="text-gray-900 font-medium text-lg">{item.itemDescription}</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Added {new Date(item.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all opacity-0 group-hover:opacity-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}