export const THEMES = [
  { id: 'neon',    name: 'Néon',             emoji: '🌌', isDark: true  },
  { id: 'cherry',  name: 'Cerisier',          emoji: '🌸', isDark: true  },
  { id: 'ocean',   name: 'Océan',             emoji: '🌊', isDark: true  },
  { id: 'prairie', name: 'Prairie',           emoji: '🌿', isDark: true  },
  { id: 'sunset',  name: 'Coucher de soleil', emoji: '🌅', isDark: true  },
  { id: 'arctic',  name: 'Arctique',          emoji: '❄️', isDark: false },
  { id: 'light',   name: 'Lumière',           emoji: '☀️', isDark: false },
] as const

export type ThemeId = typeof THEMES[number]['id']
