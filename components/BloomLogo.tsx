export default function BloomLogo({ size = 24, color = '#2F4032', centerColor = '#C4633F' }: {
  size?: number;
  color?: string;
  centerColor?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <g key={angle} transform={`rotate(${angle} 30 26)`}>
            <path d="M30 23 C27 21 25 17 27 14 C28 13 29 13 30 14 C31 13 32 13 33 14 C35 17 33 21 30 23 Z" />
          </g>
        ))}
        <path d="M30 36 C29 44 30 52 30 56" />
        <path d="M29 44 C24 43 19 41 17 38 C20 38 26 40 29 44 Z" />
        <path d="M30 42 C35 41 40 39 42 36 C39 36 33 38 30 42 Z" />
        <path d="M30 51 C26 51 22 50 20 48 C23 47 27 48 30 51 Z" />
        <circle cx="30" cy="26" r="3" stroke={color} strokeWidth="1.6" />
      </g>
      <g fill={centerColor}>
        <circle cx="30" cy="24.8" r="0.7" />
        <circle cx="28.8" cy="25.6" r="0.7" />
        <circle cx="31.2" cy="25.6" r="0.7" />
        <circle cx="29.3" cy="27" r="0.7" />
        <circle cx="30.7" cy="27" r="0.7" />
      </g>
    </svg>
  );
}
