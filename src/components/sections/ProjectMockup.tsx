import React from 'react';
import { ProjectItem } from '../../data/content.schema';
import { ImageIcon } from 'lucide-react';

interface ProjectMockupProps {
  project: ProjectItem;
  parallaxY?: number;
}

export const ProjectMockup: React.FC<ProjectMockupProps> = ({ project, parallaxY = 0 }) => {
  if (project.image) {
    return (
      <div className="relative w-full aspect-[16/10] bg-[#14161D] overflow-hidden group">
        <img
          src={project.image}
          alt={project.imageAlt || `${project.title} preview`}
          className="w-full h-full object-cover will-change-transform transition-transform duration-300 ease-out"
          style={{
            transform: parallaxY !== 0 ? `scale(1.08) translateY(${parallaxY}px)` : undefined,
            filter: 'contrast(1.05) brightness(1.02)', // ensure crisp, full brightness without any dimming
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // Clean empty window frame with a dashed neutral outline and the small label "Screenshot coming soon"
  return (
    <div className="relative w-full aspect-[16/10] bg-[#14161D] p-4 sm:p-6 flex flex-col items-center justify-center select-none font-apple">
      <div className="w-full h-full border border-dashed border-white/20 rounded-[16px] flex flex-col items-center justify-center gap-3 bg-white/[0.02]">
        <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/50">
          <ImageIcon className="w-5 h-5" />
        </div>
        <span className="text-[13px] font-sans font-medium text-[#C9C9CF] tracking-wide">
          Screenshot coming soon
        </span>
      </div>
    </div>
  );
};
