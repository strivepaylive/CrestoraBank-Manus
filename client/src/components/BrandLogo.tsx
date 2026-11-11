import { useState } from 'react';
import { Landmark } from 'lucide-react';

/**
 * Official Crestora Bank logo with a resilient fallback.
 * Renders the official logo image; if the image fails to load
 * (offline, blocked, slow network), it swaps to the blue pillar
 * icon + "Crestora" wordmark so a broken-image icon never shows.
 */
const OFFICIAL_LOGO = '/manus-storage/crestora-official-logo_03f062c7.png';

export function BrandLogo({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const imgH = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-8';
  const boxH = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-9 w-9';
  const iconH = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const textCls = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  if (failed) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${boxH} rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0`}>
          <Landmark className={`${iconH} text-white`} />
        </div>
        <span className={`${textCls} font-bold text-slate-900 whitespace-nowrap`}>Crestora Bank</span>
      </div>
    );
  }

  return (
    <img
      src={OFFICIAL_LOGO}
      alt="Crestora Bank"
      className={`${imgH} w-auto ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

export default BrandLogo;
