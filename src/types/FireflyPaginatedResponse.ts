
export interface FireflyPaginatedResponse<T> {
  id: number;
  data: T[];
  meta: FireflyPaginationMeta;
}
