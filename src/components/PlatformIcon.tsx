import React from 'react';

interface PlatformIconProps {
  platform: string;
  className?: string;
}

/**
 * Official brand marks, sourced from Simple Icons (https://simpleicons.org, CC0 license).
 * These are pixel-accurate vector traces of each platform's real logo — not approximations.
 * Icons are centered on a rounded, brand-colored badge to match the app's visual language.
 *
 * NOTE: Amazon, Mercado Livre and Shein do NOT have official marks in Simple Icons
 * (those brands restrict redistribution of their exact logo). For those three we fall
 * back to a clean, simplified badge instead of guessing at the real logo shape.
 */
export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = 'w-6 h-6' }) => {
  const p = platform.toLowerCase().trim();

  // Shopee — Official logo mark (Simple Icons, CC0)
  if (p === 'shopee') {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#EE4D2D" />
        <g transform="translate(3.36,3.36) scale(0.72)">
          <path
            fill="#FFFFFF"
            d="M15.9414 17.9633c.229-1.879-.981-3.077-4.1758-4.0969-1.548-.528-2.277-1.22-2.26-2.1719.065-1.056 1.048-1.825 2.352-1.85a5.2898 5.2898 0 0 1 2.8838.89c.116.072.197.06.263-.039.09-.145.315-.494.39-.62.051-.081.061-.187-.068-.281-.185-.1369-.704-.4149-.983-.5319a6.4697 6.4697 0 0 0-2.5118-.514c-1.909.008-3.4129 1.215-3.5389 2.826-.082 1.1629.494 2.1078 1.73 2.8278.262.152 1.6799.716 2.2438.892 1.774.552 2.695 1.5419 2.478 2.6969-.197 1.047-1.299 1.7239-2.818 1.7439-1.2039-.046-2.2878-.537-3.1278-1.19l-.141-.11c-.104-.08-.218-.075-.287.03-.05.077-.376.547-.458.67-.077.108-.035.168.045.234.35.293.817.613 1.134.775a6.7097 6.7097 0 0 0 2.8289.727 4.9048 4.9048 0 0 0 2.0759-.354c1.095-.465 1.8029-1.394 1.9449-2.554zM11.9986 1.4009c-2.068 0-3.7539 1.95-3.8329 4.3899h7.6657c-.08-2.44-1.765-4.3899-3.8328-4.3899zm7.8516 22.5981-.08.001-15.7843-.002c-1.074-.04-1.863-.91-1.971-1.991l-.01-.195L1.298 6.2858a.459.459 0 0 1 .45-.494h4.9748C6.8448 2.568 9.1607 0 11.9996 0c2.8388 0 5.1537 2.5689 5.2757 5.7898h4.9678a.459.459 0 0 1 .458.483l-.773 15.5883-.007.131c-.094 1.094-.979 1.9769-2.0709 2.0059z"
          />
        </g>
      </svg>
    );
  }

  // TikTok — Official logo mark (Simple Icons, CC0)
  if (p.includes('tiktok')) {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#000000" />
        <g transform="translate(3.36,3.36) scale(0.72)">
          <path
            fill="#FFFFFF"
            d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
          />
        </g>
      </svg>
    );
  }

  // Amazon — No official mark available via Simple Icons (brand restricts redistribution).
  // Clean simplified badge instead of an inaccurate guess at the real logo.
  if (p === 'amazon') {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#131A22" />
        <text
          x="12"
          y="15.2"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, Helvetica, Arial, sans-serif"
          fontSize="11.5"
          fontWeight="800"
          fill="#FFFFFF"
        >
          a
        </text>
        <path d="M6.8 17.1c2.8 1.8 7 2.1 10.2.4" stroke="#FF9900" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M15.7 16.5l1.5.65-.3 1.65" stroke="#FF9900" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  // Instagram — Official 2022 glyph mark (Simple Icons, CC0), on the brand's signature gradient
  if (p === 'instagram' || p === 'insta') {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ig-official-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="20%" stopColor="#F56040" />
            <stop offset="40%" stopColor="#F77737" />
            <stop offset="70%" stopColor="#E1306C" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#ig-official-grad)" />
        <g transform="translate(3.36,3.36) scale(0.72)">
          <path
            fill="#FFFFFF"
            d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"
          />
        </g>
      </svg>
    );
  }

  // AliExpress — Official logo mark (Simple Icons, CC0)
  if (p === 'aliexpress' || p === 'aliex') {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#FF4747" />
        <g transform="translate(3.36,3.36) scale(0.72)">
          <path
            fill="#FFFFFF"
            d="M5.166 9.096a.022.022 0 0 0-.022.021c0 .396-.32.717-.713.717a.021.021 0 0 0-.021.022c0 .012.01.021.021.021.394 0 .713.322.713.718 0 .012.01.021.022.021.011 0 .021-.01.021-.021A.717.717 0 0 1 5.9 9.88a.021.021 0 0 0 0-.043.716.716 0 0 1-.713-.718v-.002a.021.021 0 0 0-.006-.015.022.022 0 0 0-.015-.006zm-3.693.526L0 13.462h.48l.355-.922h1.782l.354.922h.481L1.98 9.622zm2.264.002v3.838h.491V9.624zm2.375 0v3.838h2.413v-.502H6.613v-1.19H8.19v-.477H6.613v-1.166h1.773v-.502zm-4.386.592l.698 1.82H1.028zm14.689.402a1.466 1.466 0 0 0-.966.366V10.7h-.491v2.763h.49c.002-.477 0-.955.002-1.433a.969.969 0 0 1 .965-.918zm4.18.007c-.053 0-.105.003-.158.01-.315.031-.606.175-.753.377a.689.689 0 0 0-.14.465c.007.2.066.357.233.496.184.147.42.2.657.259.311.067.426.095.546.186.08.07.133.127.136.27 0 .25-.221.372-.42.41a.89.89 0 0 1-.894-.344l-.371.288c.33.382.777.505 1.09.5.54-.01.891-.217 1.029-.534.066-.153.063-.309.063-.38a.677.677 0 0 0-.267-.545c-.228-.177-.583-.228-.636-.242-.437-.078-.658-.196-.697-.341-.043-.192.102-.35.297-.411a.76.76 0 0 1 .857.277l.367-.247a1.166 1.166 0 0 0-.939-.494zm2.387 0c-.052 0-.105.003-.157.01-.316.031-.607.175-.753.377a.689.689 0 0 0-.14.465c.006.2.065.357.233.496.183.147.42.2.657.259.31.067.426.095.545.186.081.07.134.127.136.27.001.25-.221.372-.42.41a.89.89 0 0 1-.894-.344l-.371.288c.33.382.777.505 1.09.5.541-.01.891-.217 1.03-.534.065-.153.062-.309.062-.38a.677.677 0 0 0-.267-.545c-.227-.177-.583-.228-.636-.242-.437-.078-.658-.196-.696-.341-.043-.192.101-.35.297-.411a.76.76 0 0 1 .857.277l.367-.247a1.167 1.167 0 0 0-.94-.494zm-9.84.002a1.461 1.461 0 0 0-1.42 1.117 1.305 1.305 0 0 0-.041.327v2.833h.491v-1.813c.17.18.487.42.96.454a1.447 1.447 0 0 0 1.208-.627 1.457 1.457 0 0 0-1.199-2.292zm4.804 0a1.448 1.448 0 0 0-1.288 2.08c.255.53.811.87 1.412.833a1.452 1.452 0 0 0 1.012-.51l-.363-.291a.968.968 0 0 1-1.106.273 1.01 1.01 0 0 1-.602-.69h2.239l.002-.427a1.295 1.295 0 0 0-1.306-1.268zm-9.2.08l1.062 1.377-1.062 1.378h.581l.779-1.01.778 1.01h.581l-1.062-1.378 1.062-1.378h-.581l-.778 1.01-.779-1.01zm-3.825.015v2.74h.49v-2.74zm8.233.37a.96.96 0 0 1 .95.993.963.963 0 0 1-.863.998.962.962 0 0 1-1.034-.739c-.074-.382 0-.746.307-1.019a.959.959 0 0 1 .64-.233zm4.79.015a.823.823 0 0 1 .819.755h-1.76a.964.964 0 0 1 .94-.755z"
          />
        </g>
      </svg>
    );
  }

  // Mercado Livre — No official mark available via Simple Icons.
  // Clean simplified badge instead of an inaccurate guess at the real logo.
  if (p.includes('mercado') || p === 'ml' || p === 'mercadolivre' || p === 'mercadolibre') {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#FFE600" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, Helvetica, Arial, sans-serif"
          fontSize="11"
          fontWeight="800"
          fill="#2D3277"
        >
          M
        </text>
      </svg>
    );
  }

  // Shein — No official mark available via Simple Icons.
  // Clean simplified badge instead of an inaccurate guess at the real logo.
  if (p === 'shein') {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#000000" />
        <text
          x="12"
          y="15.7"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, Helvetica, Arial, sans-serif"
          fontSize="11"
          fontWeight="800"
          fill="#FFFFFF"
        >
          S
        </text>
      </svg>
    );
  }

  // Generic / Default Store Logo Badge
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#18181B" stroke="#3F3F46" strokeWidth="0.75" />
      <path
        d="M8.475 10.05a3.525 3.525 0 0 1 7.05 0"
        stroke="#EC4899"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6.9 9.83h10.2l-.765 7.84a1.725 1.725 0 0 1-1.717 1.56h-5.236a1.725 1.725 0 0 1-1.717-1.56L6.9 9.83z"
        fill="#EC4899"
        fillOpacity="0.16"
        stroke="#EC4899"
        strokeWidth="1"
      />
    </svg>
  );
};
