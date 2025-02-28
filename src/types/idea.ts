
export interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  summary: string;
  votes: number;
}

export const categories = ["All", "Education", "Environment", "Community", "Technology", "Health"];
