export const DEFAULT_ACTIVITY_TEMPLATES = [
  { title: 'Alimentar', icon: 'bone', targetCountPerDay: 2, isTimer: false, sortOrder: 1 },
  { title: 'Passear', icon: 'footprints', targetCountPerDay: 2, isTimer: true, sortOrder: 2 },
  { title: 'Brincar', icon: 'play', targetCountPerDay: 1, isTimer: true, sortOrder: 3 },
  { title: 'Trocar água', icon: 'droplets', targetCountPerDay: 3, isTimer: false, sortOrder: 4 },
] as const;
