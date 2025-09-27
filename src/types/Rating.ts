export interface Rating {
  id: string;
  score: number; // 1-10
  user: 'me' | 'gf';
  createdAt: string;
}
