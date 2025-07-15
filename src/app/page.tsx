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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Info Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">사용자 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">나이</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.userInfo.age || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    userInfo: { ...formData.userInfo, age: parseInt(e.target.value) || undefined }
                  })}
                  placeholder="예: 28"
                />
              </div>
              <div>
                <label className="label">성별</label>
                <select
                  className="input-field"
                  value={formData.userInfo.gender || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    userInfo: { ...formData.userInfo, gender: e.target.value }
                  })}
                >
                  <option value="">선택하세요</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="label">직업</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.userInfo.occupation || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    userInfo: { ...formData.userInfo, occupation: e.target.value }
                  })}
                  placeholder="예: 디자이너"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">이 정보 저장하기</span>
              </label>
            </div>
          </section>

          {/* Context Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">상황 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">날짜</label>
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
                <label className="label">지역</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.context.location}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, location: e.target.value }
                  })}
                  placeholder="예: 서울"
                  required
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              입력하신 날짜와 지역의 날씨 정보를 반영하여 스타일을 추천해 드립니다.
            </p>
          </section>

          {/* Style Request Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">스타일 요청</h2>
            <div className="space-y-4">
              <div>
                <label className="label">원하는 아이템</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.request.item}
                  onChange={(e) => setFormData({
                    ...formData,
                    request: { ...formData.request, item: e.target.value }
                  })}
                  placeholder="예: 청바지, 화이트 스니커즈"
                  required
                />
                <p className="mt-1 text-sm text-gray-600">
                  한 가지 이상의 아이템만 입력하시면 나머지는 AI가 어울리게 조합해 드립니다.
                </p>
              </div>
              <div>
                <label className="label">TPO 정보</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.request.tpo}
                  onChange={(e) => setFormData({
                    ...formData,
                    request: { ...formData.request, tpo: e.target.value }
                  })}
                  placeholder="예: 주말 데이트, 중요한 비즈니스 미팅"
                  required
                />
              </div>
              <div>
                <label className="label">원하는 분위기</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.request.mood}
                  onChange={(e) => setFormData({
                    ...formData,
                    request: { ...formData.request, mood: e.target.value }
                  })}
                  placeholder="예: 미니멀, 스트릿, 페미닌, 힙하게"
                  required
                />
              </div>
            </div>
          </section>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 text-lg font-semibold flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  추천받는 중...
                </>
              ) : (
                '스타일 추천받기'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}