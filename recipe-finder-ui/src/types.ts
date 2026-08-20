export interface RecipeCardData {
  id: string;
  title: string;
  image?: string;
  category?: string;
  area?: string;
  tags?: string[];
  source?: 'api' | 'user';
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
}

export type TagTone = 'neutral' | 'accent' | 'success' | 'warning';
