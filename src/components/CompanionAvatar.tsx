import React from 'react';

interface CompanionAvatarProps {
  size?: number;
  mood?: 'focus' | 'proud' | 'sleepy' | 'curious';
  className?: string;
  withGlow?: boolean;
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  size = 120,
  mood = 'focus',
  className = '',
  withGlow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient background glow */}
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60 transition-all duration-700 pointer-events-none"
          style={{
            background:
              mood === 'proud'
                ? 'radial-gradient(circle, #FBBF24 0%, #00E5FF 60%, transparent 80%)'
                : 'radial-gradient(circle, #00E5FF 0%, #8B5CF6 55%, transparent 75%)',
          }}
        />
      )}

      {/* Vector Illustration of Neo / Alex the Cosmic Fox Companion */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="relative z-10 drop-shadow-md"
      >
        <defs>
          <linearGradient id="foxFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="foxChest" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="cyanHeadphone" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <filter id="headphoneGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft circle base frame */}
        <circle cx="100" cy="100" r="92" fill="#0B132B" stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0.4" />

        {/* Big cozy ears */}
        {/* Left Ear */}
        <path d="M 52 85 L 35 28 C 35 28 65 35 78 68 Z" fill="url(#foxFur)" />
        <path d="M 52 75 L 44 42 C 44 42 62 48 68 66 Z" fill="#F472B6" opacity="0.85" />

        {/* Right Ear */}
        <path d="M 148 85 L 165 28 C 165 28 135 35 122 68 Z" fill="url(#foxFur)" />
        <path d="M 148 75 L 156 42 C 156 42 138 48 132 66 Z" fill="#F472B6" opacity="0.85" />

        {/* Cozy Dark Hoodie Torso */}
        <path
          d="M 50 185 C 50 145 70 135 100 135 C 130 135 150 145 150 185 Z"
          fill="url(#hoodieGrad)"
          stroke="#334155"
          strokeWidth="2"
        />
        {/* Hoodie Strings */}
        <path d="M 90 148 Q 88 165 85 174" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 110 148 Q 112 165 115 174" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Head Shape */}
        <ellipse cx="100" cy="105" rx="52" ry="46" fill="url(#foxFur)" />

        {/* White / Soft cheeks and snout patch */}
        <path
          d="M 68 108 C 68 134 85 144 100 144 C 115 144 132 134 132 108 C 122 102 112 110 100 110 C 88 110 78 102 68 108 Z"
          fill="url(#foxChest)"
        />

        {/* Little cute black nose */}
        <polygon points="100,120 95,114 105,114" fill="#070A13" />

        {/* Eyes based on mood */}
        {mood === 'proud' ? (
          // Happy smiling curved eyes
          <>
            <path d="M 75 98 Q 85 88 92 98" stroke="#070A13" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 108 98 Q 115 88 125 98" stroke="#070A13" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'focus' ? (
          // Determined sparkling anime eyes
          <>
            <ellipse cx="80" cy="96" rx="8" ry="11" fill="#070A13" />
            <circle cx="78" cy="92" r="3.5" fill="#FFFFFF" />
            <circle cx="83" cy="99" r="1.5" fill="#00E5FF" />

            <ellipse cx="120" cy="96" rx="8" ry="11" fill="#070A13" />
            <circle cx="118" cy="92" r="3.5" fill="#FFFFFF" />
            <circle cx="123" cy="99" r="1.5" fill="#00E5FF" />
          </>
        ) : (
          // Curious eyes
          <>
            <circle cx="80" cy="96" r="7" fill="#070A13" />
            <circle cx="78" cy="94" r="2.5" fill="#FFFFFF" />
            <circle cx="120" cy="96" r="7" fill="#070A13" />
            <circle cx="118" cy="94" r="2.5" fill="#FFFFFF" />
          </>
        )}

        {/* Cute blush */}
        <circle cx="68" cy="116" r="6" fill="#F43F5E" opacity="0.4" />
        <circle cx="132" cy="116" r="6" fill="#F43F5E" opacity="0.4" />

        {/* Gentle smiling mouth */}
        <path d="M 94 125 Q 100 130 106 125" stroke="#070A13" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Glowing Cyan Headphones (Signature Accessory) */}
        {/* Headband arch */}
        <path
          d="M 50 100 C 45 42 155 42 150 100"
          fill="none"
          stroke="#0F172A"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 50 100 C 45 42 155 42 150 100"
          fill="none"
          stroke="url(#cyanHeadphone)"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter="url(#headphoneGlow)"
        />

        {/* Left Ear Cushion */}
        <rect x="36" y="86" width="16" height="34" rx="8" fill="#0F172A" stroke="#00E5FF" strokeWidth="3" filter="url(#headphoneGlow)" />
        <circle cx="44" cy="103" r="3" fill="#00E5FF" />

        {/* Right Ear Cushion */}
        <rect x="148" y="86" width="16" height="34" rx="8" fill="#0F172A" stroke="#00E5FF" strokeWidth="3" filter="url(#headphoneGlow)" />
        <circle cx="156" cy="103" r="3" fill="#00E5FF" />
      </svg>
    </div>
  );
};
