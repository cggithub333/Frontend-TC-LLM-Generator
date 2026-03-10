export interface PageInfo {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface HateoasLink {
  href: string;
}

export interface PagedResponse<T> {
  _embedded: Record<string, T[]>;
  _links: Record<string, HateoasLink>;
  page: PageInfo;
}

export interface PaginatedResult<T> {
  items: T[];
  page: PageInfo;
}

export function extractPage<T>(data: PagedResponse<T>): PaginatedResult<T> {
  const embeddedKey = Object.keys(data._embedded ?? {})[0];
  const items = embeddedKey ? (data._embedded[embeddedKey] as T[]) : [];
  return { items, page: data.page };
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}
