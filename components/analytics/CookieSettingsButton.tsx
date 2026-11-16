'use client';

import { openCookieSettings } from '@/lib/consent';

/**
 * Footer link that reopens the consent banner, so visitors can withdraw consent as easily
 * as they gave it. Hidden by CSS unless analytics is enabled (`<html data-analytics>`).
 */
export default function CookieSettingsButton() {
  return (
    <button type="button" className="cookie-settings-link" onClick={openCookieSettings}>
      Cookie settings
    </button>
  );
}
