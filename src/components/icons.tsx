import type { SVGProps } from 'react';
import Image from 'next/image';

type IconProps = SVGProps<SVGSVGElement> & {
  logoUrl?: string | null;
  width?: number;
  height?: number;
};

export const Icons = {
  logo: ({ logoUrl, width = 32, height = 32, ...props }: IconProps) => {
    if (logoUrl) {
      // If logo is a local asset path, use native <img> to avoid Next/Image optimization errors
      if (logoUrl.startsWith('/')) {
        return <img src={logoUrl} alt="Logo" width={width} height={height} />;
      }
      return <Image src={logoUrl} alt="Logo" width={width} height={height} unoptimized />;
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M12 11v6" />
        <path d="m9 14 3 3 3-3" />
      </svg>
    );
  },
};
