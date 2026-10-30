import React from 'react';
import {
  FileCode2,
  Terminal,
  Code,
  Cpu,
  Smartphone,
  Atom,
  Palette,
  Sparkles,
  Layers,
  Volume2,
  Network,
  Radio,
  Container,
  Database,
  Apple,
  Figma,
  Eye,
  GitBranch,
  type LucideProps
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  FileCode2,
  Terminal,
  Code,
  Cpu,
  Smartphone,
  Atom,
  Palette,
  Sparkles,
  Layers,
  Volume2,
  Network,
  Radio,
  Container,
  Database,
  Apple,
  Figma,
  Eye,
  GitBranch,
};

export const getSkillOrToolIconComponent = (iconName: string): React.ComponentType<LucideProps> => {
  return iconMap[iconName] || Code;
};
