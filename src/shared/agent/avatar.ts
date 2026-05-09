export const AgentAvatarIconFormat = {
  Svg: 'agent-avatar-svg',
} as const;

export type AgentAvatarIconFormat = typeof AgentAvatarIconFormat[keyof typeof AgentAvatarIconFormat];

export const AgentAvatarIconSeparator = {
  Value: ':',
} as const;

export const AgentAvatarSvg = {
  Lobster: 'lobster',
  Code: 'code',
  Repair: 'repair',
  Briefcase: 'briefcase',
  ShoppingCart: 'shopping-cart',
  Data: 'data',
  Document: 'document',
  Folder: 'folder',
  Tag: 'tag',
  Brain: 'brain',
  GraduationCap: 'graduation-cap',
  Books: 'books',
  Experiment: 'experiment',
  Diagnosis: 'diagnosis',
  Scales: 'scales',
  Translation: 'translation',
  TranslationAlt: 'translation-alt',
  Creation: 'creation',
  Artboard: 'artboard',
  Music: 'music',
  Entertainment: 'entertainment',
  Headphones: 'headphones',
  Inspiration: 'inspiration',
  Lightning: 'lightning',
  Travel: 'travel',
  Fitness: 'fitness',
  Meditation: 'meditation',
  Heart: 'heart',
  PottedPlant: 'potted-plant',
  Pet: 'pet',
} as const;

export type AgentAvatarSvg = typeof AgentAvatarSvg[keyof typeof AgentAvatarSvg];

export interface DesignedAgentAvatar {
  svg: AgentAvatarSvg;
}

const AGENT_AVATAR_PART_COUNT = 2;

const AGENT_AVATAR_SVGS = new Set<string>(Object.values(AgentAvatarSvg));

export const DefaultAgentAvatar = {
  svg: AgentAvatarSvg.Lobster,
} as const satisfies DesignedAgentAvatar;

export const isAgentAvatarSvg = (value: string): value is AgentAvatarSvg => {
  return AGENT_AVATAR_SVGS.has(value);
};

const LegacyAgentAvatarIconFormat = {
  Designed: 'agent-avatar',
} as const;

const LegacyAgentAvatarColor = {
  Ink: 'ink',
  Coral: 'coral',
  Orange: 'orange',
  Amber: 'amber',
  Green: 'green',
  Blue: 'blue',
  Violet: 'violet',
  Pink: 'pink',
} as const;

const LegacyAgentAvatarGlyph = {
  Folder: 'folder',
  Finance: 'finance',
  Book: 'book',
  Education: 'education',
  Writing: 'writing',
  Design: 'design',
  Code: 'code',
  Terminal: 'terminal',
  Music: 'music',
  Media: 'media',
  Art: 'art',
  Operations: 'operations',
  Research: 'research',
  Automation: 'automation',
  Growth: 'growth',
  Business: 'business',
  Analytics: 'analytics',
  Support: 'support',
  Training: 'training',
  Notes: 'notes',
  Legal: 'legal',
  Voice: 'voice',
  Travel: 'travel',
  Global: 'global',
  Tools: 'tools',
  Science: 'science',
  Memory: 'memory',
  Care: 'care',
  Gift: 'gift',
  Launch: 'launch',
} as const;

const LEGACY_AGENT_AVATAR_PART_COUNT = 3;
const LEGACY_AGENT_AVATAR_COLORS = new Set<string>(Object.values(LegacyAgentAvatarColor));
const LEGACY_AGENT_AVATAR_GLYPH_TO_SVG: Record<string, AgentAvatarSvg> = {
  [LegacyAgentAvatarGlyph.Folder]: AgentAvatarSvg.Folder,
  [LegacyAgentAvatarGlyph.Finance]: AgentAvatarSvg.Data,
  [LegacyAgentAvatarGlyph.Book]: AgentAvatarSvg.Books,
  [LegacyAgentAvatarGlyph.Education]: AgentAvatarSvg.GraduationCap,
  [LegacyAgentAvatarGlyph.Writing]: AgentAvatarSvg.Creation,
  [LegacyAgentAvatarGlyph.Design]: AgentAvatarSvg.Artboard,
  [LegacyAgentAvatarGlyph.Code]: AgentAvatarSvg.Code,
  [LegacyAgentAvatarGlyph.Terminal]: AgentAvatarSvg.Code,
  [LegacyAgentAvatarGlyph.Music]: AgentAvatarSvg.Music,
  [LegacyAgentAvatarGlyph.Media]: AgentAvatarSvg.Entertainment,
  [LegacyAgentAvatarGlyph.Art]: AgentAvatarSvg.Artboard,
  [LegacyAgentAvatarGlyph.Operations]: AgentAvatarSvg.Repair,
  [LegacyAgentAvatarGlyph.Research]: AgentAvatarSvg.Brain,
  [LegacyAgentAvatarGlyph.Automation]: AgentAvatarSvg.Lightning,
  [LegacyAgentAvatarGlyph.Growth]: AgentAvatarSvg.Inspiration,
  [LegacyAgentAvatarGlyph.Business]: AgentAvatarSvg.Briefcase,
  [LegacyAgentAvatarGlyph.Analytics]: AgentAvatarSvg.Data,
  [LegacyAgentAvatarGlyph.Support]: AgentAvatarSvg.Headphones,
  [LegacyAgentAvatarGlyph.Training]: AgentAvatarSvg.GraduationCap,
  [LegacyAgentAvatarGlyph.Notes]: AgentAvatarSvg.Document,
  [LegacyAgentAvatarGlyph.Legal]: AgentAvatarSvg.Scales,
  [LegacyAgentAvatarGlyph.Voice]: AgentAvatarSvg.Headphones,
  [LegacyAgentAvatarGlyph.Travel]: AgentAvatarSvg.Travel,
  [LegacyAgentAvatarGlyph.Global]: AgentAvatarSvg.Translation,
  [LegacyAgentAvatarGlyph.Tools]: AgentAvatarSvg.Repair,
  [LegacyAgentAvatarGlyph.Science]: AgentAvatarSvg.Experiment,
  [LegacyAgentAvatarGlyph.Memory]: AgentAvatarSvg.Brain,
  [LegacyAgentAvatarGlyph.Care]: AgentAvatarSvg.Heart,
  [LegacyAgentAvatarGlyph.Gift]: AgentAvatarSvg.Tag,
  [LegacyAgentAvatarGlyph.Launch]: AgentAvatarSvg.Lightning,
};

export const encodeAgentAvatarIcon = (avatar: DesignedAgentAvatar): string => {
  return [
    AgentAvatarIconFormat.Svg,
    avatar.svg,
  ].join(AgentAvatarIconSeparator.Value);
};

export const DefaultAgentAvatarIcon = encodeAgentAvatarIcon(DefaultAgentAvatar);

const parseLegacyAgentAvatarIcon = (parts: string[]): DesignedAgentAvatar | null => {
  if (parts.length !== LEGACY_AGENT_AVATAR_PART_COUNT) return null;

  const [format, color, glyph] = parts;
  if (format !== LegacyAgentAvatarIconFormat.Designed) return null;
  if (!LEGACY_AGENT_AVATAR_COLORS.has(color)) return null;

  const svg = LEGACY_AGENT_AVATAR_GLYPH_TO_SVG[glyph];
  if (!svg) return null;

  return { svg };
};

export const parseAgentAvatarIcon = (value: string | null | undefined): DesignedAgentAvatar | null => {
  const normalized = value?.trim() ?? '';
  if (!normalized) return null;

  const parts = normalized.split(AgentAvatarIconSeparator.Value);
  if (parts[0] === LegacyAgentAvatarIconFormat.Designed) {
    return parseLegacyAgentAvatarIcon(parts);
  }

  if (parts.length !== AGENT_AVATAR_PART_COUNT) return null;

  const [format, svg] = parts;
  if (format !== AgentAvatarIconFormat.Svg) return null;
  if (!isAgentAvatarSvg(svg)) return null;

  return { svg };
};

export const isDesignedAgentAvatarIcon = (value: string | null | undefined): boolean => {
  return parseAgentAvatarIcon(value) !== null;
};

export const normalizeAgentAvatarIcon = (value: string | null | undefined): string => {
  const normalized = value?.trim() ?? '';
  const avatar = parseAgentAvatarIcon(normalized);
  if (avatar) return encodeAgentAvatarIcon(avatar);
  return DefaultAgentAvatarIcon;
};
