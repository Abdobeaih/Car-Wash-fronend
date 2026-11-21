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
          <stop offset="0" stopColor="#e08a4e" />
          <stop offset="1" stopColor="#c45a2a" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="#181716" />
      <path
        d="M24 6.5 C30.8 15 35.2 20.3 35.2 26.4 A11.2 11.2 0 1 1 12.8 26.4 C12.8 20.3 17.2 15 24 6.5 Z"
        fill="url(#mcc-logo-g)"
      />
      <path
        d="M16.5 29.5 h15 M18.5 26.2 l1.8-3.2 c0.5-0.9 1.4-1.4 2.4-1.4 h2.6 c1 0 1.9 0.5 2.4 1.4 l1.8 3.2"
        stroke="#181716"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19.5" cy="30.8" r="1.7" fill="#181716" />
      <circle cx="28.5" cy="30.8" r="1.7" fill="#181716" />
    </svg>
  );
}
