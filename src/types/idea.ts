
export interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  votes: number;
}

export const categories = ["All", "Education", "Environment", "Community", "Technology", "Health"];
