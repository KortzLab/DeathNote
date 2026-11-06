export function GothicBackdrop() {
  const windows = [-1, 0, 1];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-x-0 top-0 h-[92vh] w-full opacity-[0.22]"
      >
        <defs>
          <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9d6de" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#7d8d97" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0a0b0d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {windows.map((i) => {
          const cx = 600 + i * 330;
          const w = i === 0 ? 170 : 130;
          const top = i === 0 ? 70 : 140;
          const x = cx - w / 2;
          return (
            <g key={i} stroke="#05060a" strokeWidth="6" fill="url(#glass)">
              <path
                d={`M${x} 760 V${top + w * 0.9} Q${x} ${top} ${cx} ${top - 40} Q${x + w} ${top} ${x + w} ${top + w * 0.9} V760 Z`}
              />
              <path
                d={`M${cx} ${top - 30} V760 M${x} ${top + w * 1.6} H${x + w} M${x} ${top + w * 2.6} H${x + w} M${x} ${top + w * 3.4} H${x + w}`}
                fill="none"
              />
              <circle cx={cx} cy={top + w * 0.55} r={w * 0.26} fill="none" />
              <path
                d={`M${cx - w * 0.26} ${top + w * 0.55} H${cx + w * 0.26} M${cx} ${top + w * 0.29} V${top + w * 0.81}`}
                fill="none"
                strokeWidth="4"
              />
              <path
                d={`M${x} ${top + w * 1.6} Q${x + w * 0.25} ${top + w * 1.15} ${cx} ${top + w * 1.6} Q${x + w * 0.75} ${top + w * 1.15} ${x + w} ${top + w * 1.6}`}
                fill="none"
                strokeWidth="4"
              />
            </g>
          );
        })}
      </svg>
      <div className="backdrop-shafts" />
      <div className="backdrop-rain" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  );
}
