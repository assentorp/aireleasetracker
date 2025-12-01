'use client';

interface ViewToggleProps {
  currentView: 'timeline' | 'list';
  onViewChange: (view: 'timeline' | 'list') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-[#0f0f0f] rounded-full p-1 border border-white/10">
      <button
        onClick={() => onViewChange('timeline')}
        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
          currentView === 'timeline'
            ? 'bg-[#1a1a1a] text-white'
            : 'text-white hover:text-gray-300'
        }`}
      >
        Timeline
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
          currentView === 'list'
            ? 'bg-[#1a1a1a] text-white'
            : 'text-white hover:text-gray-300'
        }`}
      >
        List
      </button>
    </div>
  );
}
