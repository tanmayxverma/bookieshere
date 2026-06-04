/**
 * URL Validation Utility
 * Implements domain whitelisting for download links to prevent data exfiltration
 */

// Allowed domains for download links
const ALLOWED_DOMAINS = [
  't.me',           // Telegram links
  'drive.google.com',
  'docs.google.com',
  'mega.nz',
  'mediafire.com',
  'dropbox.com',
  'onedrive.live.com',
  '1drv.ms',
  // Study portal domains
  'pwthor.live',
  'pw4free.in',
  'testuk.org',
  'sstudy.site',
  'squidstudy.eu.org',
  'prep4free.com',
  'lovable.app',
  'thescholarverse.site',
  'netlify.app',
  'novatra.in',
];

/**
 * Validates if a URL is safe to open
 * - Must use HTTP or HTTPS protocol
 * - Must be from an allowed domain
 */
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Check domain whitelist
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

/**
 * Returns a user-friendly error message for invalid URLs
 */
export const getUrlValidationError = (url: string): string | null => {
  if (!url.trim()) {
    return "URL is required";
  }
  
  try {
    const parsed = new URL(url);
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return "URL must use HTTP or HTTPS protocol";
    }
    
    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return `Domain "${hostname}" is not in the allowed list. Allowed: ${ALLOWED_DOMAINS.join(', ')}`;
    }
    
    return null;
  } catch {
    return "Invalid URL format";
  }
};

/**
 * List of allowed domains (for display purposes)
 */
export const getAllowedDomains = (): string[] => [...ALLOWED_DOMAINS];
