export interface ArticleNavigationEntry {
  id: string;
  title: string;
}

export interface ArticleNavigationTarget extends ArticleNavigationEntry {
  url: string;
}

export interface ArticleNavigationProps {
  currentId: string;
  categoryId: string;
  allEntries: ArticleNavigationEntry[];
  categoryEntries: ArticleNavigationEntry[];
  previous: ArticleNavigationTarget | null;
  next: ArticleNavigationTarget | null;
}
