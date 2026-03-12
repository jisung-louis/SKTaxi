export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  cursor: unknown;
}
