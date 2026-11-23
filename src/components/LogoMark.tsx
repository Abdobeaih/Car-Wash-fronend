export default function LogoMark({
  size = 36,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="mcc-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2ed3b8" />
          <stop offset="1" stopColor="#0e6672" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="#0e2a31" />
      <path
        d="M8 29.5 C9 26 11.5 24.3 15 23.8 L18.3 19.3 C19.2 18.1 20.6 17.5 22.2 17.5 H26.8 C28.7 17.5 30.3 18.3 31.4 19.9 L33.9 23.6 C36.7 24.2 38.2 25.8 38.8 28.2 C39 29.2 38.4 30 37.3 30 H34.8"
        stroke="url(#mcc-logo-g)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M22.6 30 H25.4" stroke="url(#mcc-logo-g)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13.2 30 H8.6" stroke="url(#mcc-logo-g)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16.2" cy="31.4" r="3.4" fill="#0e2a31" stroke="url(#mcc-logo-g)" strokeWidth="2.4" />
      <circle cx="31.8" cy="31.4" r="3.4" fill="#0e2a31" stroke="url(#mcc-logo-g)" strokeWidth="2.4" />
      <circle cx="16.2" cy="31.4" r="1.1" fill="url(#mcc-logo-g)" />
      <circle cx="31.8" cy="31.4" r="1.1" fill="url(#mcc-logo-g)" />
      <path
        d="M39 8 L40 10.6 L42.6 11.6 L40 12.6 L39 15.2 L38 12.6 L35.4 11.6 L38 10.6 Z"
        fill="url(#mcc-logo-g)"
      />
    </svg>
  );
}
