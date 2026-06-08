import { API_BASE_URL } from '@/constants/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  formData?: FormData;
};

let tokenGetter: (() => string | null) | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;

export function setAuthHandlers(
  getToken: () => string | null,
  refresh: () => Promise<string | null>,
) {
  tokenGetter = getToken;
  refreshHandler = refresh;
}

function formatValidationIssue(issue: {
  loc?: (string | number)[];
  msg?: string;
}): string {
  const field = issue.loc?.filter((part) => part !== 'body').join('.') || 'field';
  return `${field}: ${issue.msg ?? 'invalid value'}`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map(formatValidationIssue).join('\n');
    }
  } catch {
    // ignore
  }
  return response.statusText || 'Request failed';
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, formData } = options;
  const authToken = token ?? tokenGetter?.() ?? null;

  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  if (body && !formData) {
    headers['Content-Type'] = 'application/json';
  }

  const doFetch = (bearer: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: bearer ? { ...headers, Authorization: `Bearer ${bearer}` } : headers,
      body: formData ?? (body ? JSON.stringify(body) : undefined),
    });

  let response = await doFetch(authToken);

  if (response.status === 401 && refreshHandler && !options.token) {
    const newToken = await refreshHandler();
    if (newToken) {
      response = await doFetch(newToken);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const detail = await parseError(response);
    throw new ApiError(detail, response.status, detail);
  }

  return response.json() as Promise<T>;
}
