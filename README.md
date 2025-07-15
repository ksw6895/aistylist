# 나만의 AI 스타일리스트

AI가 제안하는 개인 맞춤형 패션 스타일링 서비스

## 프로젝트 소개

나만의 AI 스타일리스트는 사용자의 개인 정보(나이, 성별, 직업), 상황(TPO), 원하는 아이템 및 분위기를 기반으로 Gemini AI가 개인 맞춤형 착장을 제안하는 웹 서비스입니다.

## 주요 기능

- **개인화된 착장 추천**: AI가 사용자 정보와 상황에 맞는 2가지 스타일 제안
- **My Dressing Room**: 마음에 드는 착장을 가상 옷장에 저장
- **Shopping Recommendation**: 필요한 아이템을 쇼핑 리스트에 추가
- **날씨 연동**: 실시간 날씨 정보를 반영한 스타일 추천

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres (with Prisma ORM)
- **AI Model**: Google Gemini 2.0 Flash
- **Deployment**: Vercel

## 환경 설정

1. 환경 변수 설정 (.env.local 파일 생성)
```bash
cp .env.example .env.local
```

2. 필요한 API 키 설정:
- `GEMINI_API_KEY`: Google AI Studio에서 발급
- `WEATHER_API_KEY`: OpenWeatherMap에서 발급
- Vercel Postgres 관련 변수들은 Vercel 연동 시 자동 설정

## 로컬 개발 환경 실행

```bash
# 의존성 설치
npm install

# 데이터베이스 스키마 생성
npm run db:push

# 개발 서버 실행
npm run dev
```

## Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 Import
3. 환경 변수 설정 (Settings > Environment Variables)
4. Deploy 클릭

## 데이터베이스 스키마

- **Users**: 사용자 정보
- **DressingRoomItems**: 저장된 착장 아이템
- **ShoppingListItems**: 쇼핑 추천 아이템

## 라이선스

MIT