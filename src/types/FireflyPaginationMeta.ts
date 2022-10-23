
declare interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface FireflyPaginationMeta {
  pagination: Pagination;
}
