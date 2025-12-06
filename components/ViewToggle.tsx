'use client';

interface ViewToggleProps {
  currentView: 'timeline' | 'list';
  onViewChange: (view: 'timeline' | 'list') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="relative inline-flex items-center bg-[#0f0f0f] rounded-full p-1 border border-white/10">
      {/* Animated background using clip-path */}
      <div
        className="absolute inset-1 bg-gradient-to-r from-[#1a1a1a] to-[#252525] rounded-full transition-all duration-300 ease-in-out"
        style={{
          clipPath: currentView === 'timeline'
            ? 'inset(0 50% 0 0 round 9999px)'
            : 'inset(0 0 0 50% round 9999px)'
        }}
      />

      <button
        onClick={() => onViewChange('timeline')}
        className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-300 ${
          currentView === 'timeline'
            ? 'text-white'
            : 'text-white/60 hover:text-white/80'
        }`}
      >
        Timeline
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-300 ${
          currentView === 'list'
            ? 'text-white'
            : 'text-white/60 hover:text-white/80'
        }`}
      >
        List
      </button>
    </div>
  );
}
