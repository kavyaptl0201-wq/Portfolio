import React, { useState, useEffect, useRef } from 'react';
import { TERMINAL_TILE } from '../../../config/design';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { GlassCard } from '../../common/GlassCard';

interface TerminalTileProps {
  fullName: string;
  role: string;
  from: string;
  skills: string[];
  statusText: string;
}

interface TerminalStep {
  cmd: string;
  output: string;
}

export const TerminalTile: React.FC<TerminalTileProps> = ({
  fullName,
  role,
  from,
  skills,
  statusText,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Terminal commands and outputs
  const steps: TerminalStep[] = [
    { cmd: 'whoami', output: fullName },
    { cmd: 'cat role.txt', output: role },
    { cmd: 'cat from.txt', output: from },
    { cmd: 'ls skills/', output: skills.map((s) => s.toLowerCase()).join('   ') },
    { cmd: 'echo $STATUS', output: statusText.toLowerCase() },
  ];

  // Plain text representation for screen readers
  const accessibleText = steps
    .map((s) => `$ ${s.cmd} -> ${s.output}`)
    .join('. ');

  // Typing animation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [typedCmd, setTypedCmd] = useState('');
  const [showOutput, setShowOutput] = useState<boolean[]>(new Array(steps.length).fill(false));
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const hasStartedRef = useRef(false);

  // Trigger typing once when entering view
  useEffect(() => {
    if (prefersReducedMotion) {
      setInView(true);
      setIsTypingComplete(true);
      setShowOutput(new Array(steps.length).fill(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true;
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion, steps.length]);

  // Typing engine
  useEffect(() => {
    if (!inView || prefersReducedMotion || isTypingComplete) return;

    if (currentStepIndex >= steps.length) {
      setIsTypingComplete(true);
      return;
    }

    const targetCmd = steps[currentStepIndex].cmd;
    let charIndex = typedCmd.length;

    if (charIndex < targetCmd.length) {
      const timeout = setTimeout(() => {
        setTypedCmd(targetCmd.slice(0, charIndex + 1));
      }, 35 + Math.random() * 25);
      return () => clearTimeout(timeout);
    } else {
      // Finished typing current command, show output after brief pause
      const pause = setTimeout(() => {
        setShowOutput((prev) => {
          const next = [...prev];
          next[currentStepIndex] = true;
          return next;
        });
        setCurrentStepIndex((prev) => prev + 1);
        setTypedCmd('');
      }, 140);
      return () => clearTimeout(pause);
    }
  }, [inView, currentStepIndex, typedCmd, isTypingComplete, prefersReducedMotion, steps]);

  if (!TERMINAL_TILE) return null;

  return (
    <div ref={containerRef} className="w-full">
      <GlassCard
        variant="default"
        radius="large"
        className="p-4 sm:p-7 md:p-8 font-mono text-[13px] sm:text-[14px] bg-[#0A0A0C]/90 border border-white/10 overflow-hidden"
        aria-label={`Developer Terminal: ${accessibleText}`}
        role="region"
      >
        {/* macOS Terminal Title Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 select-none">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-white/20 border border-white/10 inline-block" />
            <span className="w-3 h-3 rounded-full bg-white/20 border border-white/10 inline-block" />
            <span className="w-3 h-3 rounded-full bg-white/20 border border-white/10 inline-block" />
          </div>
          <div className="text-[12px] text-[#9A9AA0] font-mono tracking-wide">
            kavya@portfolio ~ zsh
          </div>
          <div className="w-12" />
        </div>

        {/* Terminal Body */}
        <div className="space-y-3.5 leading-relaxed" aria-hidden="true">
          {steps.map((step, idx) => {
            const isCompletedStep = idx < currentStepIndex || prefersReducedMotion;
            const isCurrentStep = idx === currentStepIndex && !prefersReducedMotion;
            const isStepOutputVisible = showOutput[idx] || prefersReducedMotion;

            if (idx > currentStepIndex && !prefersReducedMotion) {
              return null;
            }

            return (
              <div key={idx} className="space-y-1">
                {/* Command Line */}
                <div className="flex items-center gap-2 text-white/90 break-words">
                  <span className="text-[#9A9AA0] select-none font-medium">$</span>
                  <span className="font-semibold text-white break-words">
                    {isCompletedStep ? step.cmd : isCurrentStep ? typedCmd : ''}
                  </span>
                  {isCurrentStep && (
                    <span className="inline-block w-2 h-4 bg-white animate-pulse align-middle" />
                  )}
                </div>

                {/* Command Output */}
                {isStepOutputVisible && (
                  <div className="text-[#B4B4BA] pl-4 font-normal text-[13px] sm:text-[14px] break-words">
                    {step.output}
                  </div>
                )}
              </div>
            );
          })}

          {/* Idle Blinking Cursor after completion */}
          {isTypingComplete && (
            <div className="flex items-center gap-2 text-white/90 pt-1">
              <span className="text-[#9A9AA0] select-none font-medium">$</span>
              <span className="inline-block w-2 h-4 bg-white/70 animate-pulse align-middle" />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
