import { 
  mortdash_default_base_url,
  mortdash_wsc_base_url,
  mortdash_ameritrust_base_url,
  mortdash_wsc_ae_url,
  mortdash_ameritrust_ae_url,
  mortdash_default_ae_url
} from '@/config/mortdash';

export function getSourceFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.source || null;
  } catch {
    return null;
  }
}

export function getMortdashUrl(source: string | null): string {
  if (source === 'wsc') {
    return mortdash_wsc_base_url || '';
  } else if (source === 'ameritrust') {
    return mortdash_ameritrust_base_url || '';
  }
  return mortdash_default_base_url || '';
}

export function getDynamicMortdashUrl(token: string | null): string {
  const source = getSourceFromToken(token || '');
  return getMortdashUrl(source);
}

export function getMortdashAEUrl(source: string | null): string {
  if (source === 'wsc') {
    return mortdash_wsc_ae_url || '';
  } else if (source === 'ameritrust') {
    return mortdash_ameritrust_ae_url || '';
  }
  return mortdash_default_ae_url || '';
}

export function getDynamicMortdashAEUrl(token: string | null): string {
  const source = getSourceFromToken(token || '');
  return getMortdashAEUrl(source);
}

export function getMortdashUrlFromRequest(req: any): string {
  const token = req.nextUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
  return getDynamicMortdashUrl(token || null);
}

export function getMortdashAEUrlFromRequest(req: any): string {
  const token = req.nextUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
  return getDynamicMortdashAEUrl(token || null);
}
