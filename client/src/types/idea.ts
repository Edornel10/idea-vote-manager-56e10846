
export interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  summary: string;
  votes: number;
  created_at?: string;
  frozen?: boolean;
}

export const categories = ["All", "Education", "Environment", "Community", "Technology", "Health"];
