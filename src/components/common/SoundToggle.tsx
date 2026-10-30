import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../audio/useSound';
import { soundEngine } from '../../audio/soundEngine';

import { useLocation } from 'react-router-dom';
import { getHeroIntroPlayed, subscribeHeroIntro } from '../../utils/introState';

interface SoundToggleProps {
  /** Optional override for whether hero intro is actively running */
  isIntroActive?: boolean;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ isIntroActive: isIntroActiveProp }) => {
  const location = useLocation();
  const { isSoundEnabled, setSoundEnabled } = useSound();
  const [showTooltip, setShowTooltip] = useState(false);

  const [introRunning, setIntroRunning] = useState<boolean>(() => {
    if (isIntroActiveProp !== undefined) return isIntroActiveProp;
    if (typeof window === 'undefined') return false;
    if (location.pathname !== '/') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return !getHeroIntroPlayed();
  });

  useEffect(() => {
    if (isIntroActiveProp !== undefined) {
      setIntroRunning(isIntroActiveProp);
      return;
    }
    if (location.pathname !== '/') {
      setIntroRunning(false);
      return;
    }
    if (getHeroIntroPlayed()) {
      setIntroRunning(false);
      return;
    }
    const unsubscribe = subscribeHeroIntro((played) => {
      if (played) setIntroRunning(false);
    });
    return unsubscribe;
  }, [isIntroActiveProp, location.pathname]);

  const activeIntro = isIntroActiveProp !== undefined ? isIntroActiveProp : introRunning;

  // Toggle sound with sound feedback
  const handleToggle = () => {
    if (isSoundEnabled) {
      // Turning OFF: Play short quiet "button" click, then mute
      soundEngine.play('button', { gain: 0.7 });
      setTimeout(() => {
        setSoundEnabled(false);
      }, 20);
    } else {
      // Turning ON: Unmute, then play "state" thunk sound
      setSoundEnabled(true);
      setTimeout(() => {
        soundEngine.play('state');
      }, 20);
    }
  };

  // Global "M" keyboard shortcut (ignored while typing or during active gate/intro)
  useEffect(() => {
    if (activeIntro) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const tag = target.tagName?.toLowerCase();
        const isEditable = target.isContentEditable;
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable) {
          return;
        }
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSoundEnabled, activeIntro]);

  return (
    <div
      className={`fixed z-[60] flex items-center transition-all duration-500 ease-out ${
        activeIntro
          ? 'opacity-0 -translate-y-3 pointer-events-none invisible'
          : 'opacity-100 translate-y-0 pointer-events-auto visible'
      }`}
      aria-hidden={activeIntro ? 'true' : 'false'}
      style={{
        top: 'calc(12px + env(safe-area-inset-top, 0px))',
        right: 'calc(12px + env(safe-area-inset-right, 0px))',
      }}
      data-sound="none"
    >

      {/* Hover & Focus Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="hidden md:block absolute right-full mr-2.5 px-3 py-1.5 rounded-pill apple-glass-chip text-[13px] font-medium text-[#F2F2F4] whitespace-nowrap pointer-events-none animate-in fade-in duration-150"
        >
          {isSoundEnabled ? 'Turn sound effects off [M]' : 'Turn sound effects on [M]'}
        </div>
      )}

      {/* Floating 44x44 Glass Circle Button */}
      <button
        type="button"
        data-sound="none"
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-pressed={isSoundEnabled}
        aria-label={isSoundEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
        className={`apple-glass-chip apple-glass-chip-interactive w-11 h-11 rounded-full flex items-center justify-center relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white select-none transition-colors duration-200 ${
          activeIntro ? 'opacity-70 hover:opacity-100' : 'opacity-100'
        } ${
          isSoundEnabled
            ? 'text-white'
            : 'text-[#9A9AA0] hover:text-white'
        }`}
      >
        {isSoundEnabled ? (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
            {/* Monochrome white pulse dot indicator */}
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          </div>
        ) : (
          <VolumeX className="w-5 h-5 text-[#9A9AA0] hover:text-white transition-colors" />
        )}
      </button>
    </div>
  );
};
