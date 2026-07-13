// 20 color themes for the rate card image. Each theme drives the same
// layout (see rateCardTemplates.js) with a different palette, so adding
// more themes later is just adding another entry here.
export const RATE_CARD_THEMES = [
  { id: 'maroon-gold',   name: 'Maroon & Gold',     bg: ['#6B1E2B', '#4A1420'], border: '#E0C15C', accent: '#F5CB5C', textPrimary: '#F5E6B8', textSecondary: '#e8d5c4', panel: '#FAF6EE', panelAlt: '#F3EAD3', panelText: '#4A1420' },
  { id: 'black-gold',    name: 'Black & Gold',      bg: ['#1a1410', '#2b2016'], border: '#C9A227', accent: '#F5CB5C', textPrimary: '#F5E6B8', textSecondary: '#cbbfa8', panel: null, panelAlt: null, panelText: null },
  { id: 'emerald-gold',  name: 'Emerald & Gold',    bg: ['#0B3D2E', '#0f5c44'], border: '#D4AF37', accent: '#F0D264', textPrimary: '#F5EFD6', textSecondary: '#bcd9cd', panel: '#F5FBF8', panelAlt: '#e6f2ec', panelText: '#0B3D2E' },
  { id: 'royal-blue',    name: 'Royal Blue & Gold', bg: ['#0B2C6B', '#123a8a'], border: '#D4AF37', accent: '#F0D264', textPrimary: '#F5EFD6', textSecondary: '#b9c7e8', panel: '#F4F6FC', panelAlt: '#e3e9f7', panelText: '#0B2C6B' },
  { id: 'burgundy-rose', name: 'Burgundy & Rose Gold', bg: ['#4A0E1F', '#6e1830'], border: '#E8B4A0', accent: '#EFC3A8', textPrimary: '#FBEAE0', textSecondary: '#e0b8ab', panel: '#FBF3EF', panelAlt: '#f3e0d8', panelText: '#4A0E1F' },
  { id: 'ivory-gold',    name: 'Ivory & Gold',      bg: ['#F4EFE1', '#e9dfc4'], border: '#B8860B', accent: '#8a6a15', textPrimary: '#4a3a10', textSecondary: '#7a6a45', panel: '#ffffff', panelAlt: '#f2ead0', panelText: '#4a3a10' },
  { id: 'navy-silver',   name: 'Navy & Silver',     bg: ['#0d1b2a', '#1b3350'], border: '#C0C0C0', accent: '#e6e6e6', textPrimary: '#eef2f7', textSecondary: '#9fb0c3', panel: '#F5F7FA', panelAlt: '#e3e8ee', panelText: '#0d1b2a' },
  { id: 'wine-gold',     name: 'Wine & Gold',       bg: ['#3E0B14', '#5c1220'], border: '#D9A441', accent: '#EFC968', textPrimary: '#F6E7CE', textSecondary: '#d8b6a9', panel: '#FBF4EC', panelAlt: '#f0e0cf', panelText: '#3E0B14' },
  { id: 'plum-gold',     name: 'Plum & Gold',       bg: ['#3A1A3E', '#552759'], border: '#D9B44A', accent: '#EFCE7A', textPrimary: '#F3E7D8', textSecondary: '#cbb0cd', panel: '#F8F3F8', panelAlt: '#ecdfec', panelText: '#3A1A3E' },
  { id: 'forest-gold',   name: 'Forest & Gold',     bg: ['#1B3A25', '#245132'], border: '#D4AF37', accent: '#F0D264', textPrimary: '#EFEAD2', textSecondary: '#a9c2ae', panel: '#F5F8F4', panelAlt: '#e5ede3', panelText: '#1B3A25' },
  { id: 'teal-gold',     name: 'Teal & Gold',       bg: ['#0C3B3F', '#125459'], border: '#D9B44A', accent: '#F0D264', textPrimary: '#EAF4F3', textSecondary: '#a7c7c6', panel: '#F3F9F9', panelAlt: '#dcefee', panelText: '#0C3B3F' },
  { id: 'charcoal-rose', name: 'Charcoal & Rose Gold', bg: ['#2A2A2A', '#3d3d3d'], border: '#E0AC8F', accent: '#EFC3A8', textPrimary: '#F2E7DE', textSecondary: '#c2b6ae', panel: '#FAF6F3', panelAlt: '#efe1d9', panelText: '#2A2A2A' },
  { id: 'cream-bronze',  name: 'Cream & Bronze',    bg: ['#EDE3CE', '#e0d1ad'], border: '#8B5E34', accent: '#a5713f', textPrimary: '#4a3320', textSecondary: '#6e5738', panel: '#ffffff', panelAlt: '#f0e6cf', panelText: '#4a3320' },
  { id: 'ruby-gold',     name: 'Ruby Red & Gold',   bg: ['#5E0B15', '#84121f'], border: '#E8C15A', accent: '#F2D583', textPrimary: '#F8E9C9', textSecondary: '#e2b0ae', panel: '#FCF4EA', panelAlt: '#f5e2c9', panelText: '#5E0B15' },
  { id: 'sapphire-silv', name: 'Sapphire & Silver', bg: ['#0A2A5E', '#123a7a'], border: '#CFCFCF', accent: '#eaeaea', textPrimary: '#EAF0FA', textSecondary: '#a9bcd9', panel: '#F4F7FC', panelAlt: '#e0e8f4', panelText: '#0A2A5E' },
  { id: 'amethyst-gold', name: 'Amethyst & Gold',   bg: ['#3B1F5E', '#502a7c'], border: '#D9B44A', accent: '#F0D264', textPrimary: '#F1E7F5', textSecondary: '#c6b3d9', panel: '#F8F4FB', panelAlt: '#ecdff2', panelText: '#3B1F5E' },
  { id: 'coral-gold',    name: 'Coral & Gold',      bg: ['#7A2E22', '#9c3c2b'], border: '#EFCB6B', accent: '#F5DA8E', textPrimary: '#FCEFDD', textSecondary: '#e6bba8', panel: '#FEF7EE', panelAlt: '#f6e3cf', panelText: '#7A2E22' },
  { id: 'mint-gold',     name: 'Mint & Gold',       bg: ['#0E3D34', '#155448'], border: '#D9B44A', accent: '#F0D264', textPrimary: '#E8F5EF', textSecondary: '#a3c9bc', panel: '#F3FAF7', panelAlt: '#dcefe6', panelText: '#0E3D34' },
  { id: 'mustard-brown', name: 'Mustard & Brown',   bg: ['#4A2E0B', '#6b451a'], border: '#E0A72E', accent: '#EFC968', textPrimary: '#FBF0D8', textSecondary: '#dcc394', panel: '#FCF6E9', panelAlt: '#f2e2bd', panelText: '#4A2E0B' },
  { id: 'midnight-gold', name: 'Midnight & Gold',   bg: ['#050516', '#12122b'], border: '#D4AF37', accent: '#F0D264', textPrimary: '#EDEAF7', textSecondary: '#9d9bc2', panel: null, panelAlt: null, panelText: null },
]
