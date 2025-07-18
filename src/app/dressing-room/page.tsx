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
  outer: 'Outerwear',
  top: 'Tops',
  bottom: 'Bottoms',
  shoes: 'Footwear',
  bag: 'Bags',
  belt: 'Belts',
  hat: 'Headwear',
  jewelry: 'Jewelry',
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
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-4xl font-bold gradient-text mb-2">My Wardrobe</h2>
          <p className="text-gray-600">Your personal fashion collection</p>
        </div>
        
        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg inline-flex p-1">
            <button
              onClick={() => setActiveTab('category')}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'category'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              By Category
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'group'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              By Outfit
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          activeTab === 'category' ? (
            <div className="animate-scale-in">
              <div className="card-premium overflow-hidden">
                <div className="flex flex-wrap gap-2 p-6 border-b border-gray-100">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                        activeCategory === category
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {categoryNames[category]}
                    </button>
                  ))}
                </div>
                
                <div className="p-8">
                  {getItemsByCategory(activeCategory).length === 0 ? (
                    <div className="text-center py-16">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium text-gray-900 mb-2">No {categoryNames[activeCategory]} yet</p>
                      <p className="text-gray-600">Get AI recommendations to build your wardrobe</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {getItemsByCategory(activeCategory).map(item => (
                        <div key={item.id} className="group p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                          <p className="text-gray-900 font-medium">{item.itemDescription}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Added {new Date(item.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-scale-in">
              {Object.keys(groups).length === 0 ? (
                <div className="card-premium p-16 text-center">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-xl font-medium text-gray-900 mb-2">No outfit collections yet</p>
                  <p className="text-gray-600">Your outfit recommendations will appear here</p>
                </div>
              ) : (
                Object.entries(groups).map(([groupId, groupItems], index) => {
                  const firstItem = groupItems[0];
                  return (
                    <div key={groupId} className="card-premium overflow-hidden animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">
                          {firstItem.groupName || 'Style Recommendation'}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          {firstItem.groupDate && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(firstItem.groupDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          )}
                          {firstItem.groupWeather && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                              </svg>
                              {firstItem.groupWeather}
                            </span>
                          )}
                          {firstItem.groupTPO && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {firstItem.groupTPO}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {groupItems.map(item => (
                            <div key={item.id} className="group p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">{categoryNames[item.category]}</p>
                              <p className="text-gray-700">{item.itemDescription}</p>
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