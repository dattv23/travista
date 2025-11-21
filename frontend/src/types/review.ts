export interface ReviewSource {
  title: string;
  link: string;
}

export interface ReviewSummaryData {
  location: string;
  summaryKR: string;
  summaryEN: string;
  sources: ReviewSource[];
}