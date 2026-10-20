import Image from 'next/image';
import { images } from '@/lib/assets';

type BrandLogoProps = { href?: string; onClick?: () => void; className?: string };

/** The established N symbol, with a crisp, consistently spaced live wordmark. */
export default function BrandLogo({ href = '/#top', onClick, className = '' }: BrandLogoProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`brand brand-refined ${className}`}
      aria-label="Nuvato AI home"
    >
      <Image
        className="brand-symbol"
        src={images.brandMark}
        width={48}
        height={48}
        alt=""
        loading="eager"
      />
      <span className="brand-wordmark" aria-hidden="true">
        Nuvato<span> AI</span>
      </span>
    </a>
  );
}
