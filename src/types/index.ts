export interface UserInfo {
  age?: number;
  gender?: string;
  occupation?: string;
}

export interface Context {
  date: string;
  location: string;
  weather?: string;
}

export interface StyleRequest {
  item: string;
  tpo: string;
  mood: string;
}

export interface RecommendationItem {
  summary: string;
  outer: string;
  top: string;
  bottom: string;
  shoes: string;
  bag: string;
  belt: string;
  hat: string;
  jewelry: string;
}

export interface RecommendationResponse {
  recommendation_A: RecommendationItem;
  recommendation_B: RecommendationItem;
}

export interface RecommendRequest {
  userInfo: UserInfo;
  context: Context;
  request: StyleRequest;
  previousRecommendations?: RecommendationItem[];
  considering?: string;
}

export interface CategoryItem {
  category: string;
  description: string;
}

export interface WeatherData {
  temp: number;
  description: string;
  main: string;
}