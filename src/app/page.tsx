'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { UserInfo, Context, StyleRequest, RecommendationResponse } from '@/types';

export default function Home() {
  const router = useRouter();
  const { userInfo, setUserInfo, setCurrentRecommendation, clearPreviousRecommendations } = useApp();
  
  const [formData, setFormData] = useState<{
    userInfo: UserInfo;
    context: Context;
    request: StyleRequest;
  }>({
    userInfo: {
      age: userInfo.age || undefined,
      gender: userInfo.gender || '',
      occupation: userInfo.occupation || '',
    },
    context: {
      date: new Date().toISOString().split('T')[0],
      location: '',
    },
    request: {
      item: '',
      tpo: '',
      mood: '',
    },
  });

  const [saveInfo, setSaveInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userInfo: {
        age: userInfo.age || undefined,
        gender: userInfo.gender || '',
        occupation: userInfo.occupation || '',
      },
    }));
  }, [userInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (saveInfo) {
      localStorage.setItem('userInfo', JSON.stringify(formData.userInfo));
      setUserInfo(formData.userInfo);
    }

    try {
      clearPreviousRecommendations();
      localStorage.removeItem('historySaved'); // Clear history saved flag
      
      // Save request data for later use
      localStorage.setItem('lastDate', formData.context.date);
      localStorage.setItem('lastLocation', formData.context.location);
      localStorage.setItem('lastItem', formData.request.item);
      localStorage.setItem('lastTPO', formData.request.tpo);
      localStorage.setItem('lastMood', formData.request.mood);
      
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to get recommendation');

      const data: RecommendationResponse = await response.json();
      
      // Save weather info if returned
      if ('weather' in data && data.weather) {
        localStorage.setItem('lastWeather', data.weather as string);
      }
      
      setCurrentRecommendation(data);
      router.push('/recommendation');
    } catch (error) {
      console.error('Error:', error);
      alert('추천을 받는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Your Personal AI Stylist
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Curated fashion recommendations powered by AI, tailored to your unique style and occasion
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Info Section */}
          <section className="card-premium p-8 animate-scale-in">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Personal Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Age</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.userInfo.age || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    userInfo: { ...formData.userInfo, age: parseInt(e.target.value) || undefined }
                  })}
                  placeholder="28"
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  className="select-field"
                  value={formData.userInfo.gender || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    userInfo: { ...formData.userInfo, gender: e.target.value }
                  })}
                >
                  <option value="">Select</option>
                  <option value="남성">Male</option>
                  <option value="여성">Female</option>
                  <option value="기타">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Occupation</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.userInfo.occupation || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    userInfo: { ...formData.userInfo, occupation: e.target.value }
                  })}
                  placeholder="Designer"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Save my profile for future recommendations
                </span>
              </label>
            </div>
          </section>

          {/* Context Section */}
          <section className="card-premium p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Context & Weather
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.context.date}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, date: e.target.value }
                  })}
                  required
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.context.location}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, location: e.target.value }
                  })}
                  placeholder="Seoul, New York, Tokyo..."
                  required
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                We'll check the weather forecast for your selected date and location to ensure comfort
              </p>
            </div>
          </section>

          {/* Style Request Section */}
          <section className="card-premium p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              Style Preferences
            </h2>
            <div className="space-y-6">
              <div>
                <label className="label">Key Items You Want to Wear</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.request.item}
                  onChange={(e) => setFormData({
                    ...formData,
                    request: { ...formData.request, item: e.target.value }
                  })}
                  placeholder="Blue jeans, white sneakers, leather jacket..."
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Mention one or more items, and AI will create a complete outfit around them
                </p>
              </div>
              <div>
                <label className="label">Occasion (TPO)</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.request.tpo}
                  onChange={(e) => setFormData({
                    ...formData,
                    request: { ...formData.request, tpo: e.target.value }
                  })}
                  placeholder="Weekend date, business meeting, casual Friday..."
                  required
                />
              </div>
              <div>
                <label className="label">Desired Style & Mood</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.request.mood}
                  onChange={(e) => setFormData({
                    ...formData,
                    request: { ...formData.request, mood: e.target.value }
                  })}
                  placeholder="Minimal, street style, feminine, edgy, sophisticated..."
                  required
                />
              </div>
            </div>
          </section>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-12 py-4 text-lg font-semibold flex items-center gap-3 min-w-[280px] justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Your Style...
                </>
              ) : (
                <>
                  Get Style Recommendations
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}