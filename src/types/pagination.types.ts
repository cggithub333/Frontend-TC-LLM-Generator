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
  _embedded?: Record<string, T[]>;
  content?: T[];
  _links?: Record<string, HateoasLink>;
  links?: Array<{ rel: string; href: string }>;
  page: PageInfo;
}

export interface PaginatedResult<T> {
  items: T[];
  page: PageInfo;
}

export function extractPage<T>(data: PagedResponse<T>): PaginatedResult<T> {
  // Try HATEOAS _embedded format first
  if (data._embedded) {
    const embeddedKey = Object.keys(data._embedded)[0];
    const items = embeddedKey ? (data._embedded[embeddedKey] as T[]) : [];
    return { items, page: data.page };
  }
  // Fallback to content array format (Spring Data / ApiResponse wrapped PagedModel)
  if (data.content) {
    return { items: data.content, page: data.page };
  }
  return { items: [], page: data.page };
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}
