export const CONFIG = {
  // 'low' | 'medium'
  MAP_RESOLUTION: 'low' as const, 
};

export type Config = typeof CONFIG;
