const rawBase =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')
    : '';

/**
 * Resolves backend API URLs so deployments on static hosts (such as GitHub Pages)
 * can optionally target a separately hosted Node/Express MARS backend via VITE_API_BASE_URL.
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return rawBase ? `${rawBase}${normalizedPath}` : normalizedPath;
}

export function isJsonResponse(res: Response): boolean {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  return contentType.includes('application/json') || contentType.includes('+json');
}

export async function safeParseJsonResponse(
  res: Response
): Promise<{ ok: boolean; isJson: boolean; data: Record<string, any> }> {
  const isJson = isJsonResponse(res);
  const text = await res.text().catch(() => '');
  if (!text) {
    return { ok: true, isJson, data: {} };
  }
  try {
    const parsed = JSON.parse(text);
    return {
      ok: true,
      isJson: true,
      data: parsed && typeof parsed === 'object' ? (parsed as Record<string, any>) : {}
    };
  } catch {
    return { ok: false, isJson: false, data: {} };
  }
}
