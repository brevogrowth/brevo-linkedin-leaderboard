// Brevo branding configuration

export const BRANDING = {
  // Brand name
  name: 'Brevo',
  productName: 'LinkedIn Voice Program Tracker',
  tagline: 'Track your LinkedIn presence and climb the leaderboard',

  // Colors (matching CSS variables)
  colors: {
    primary: '#00925D',
    primaryDark: '#007A4D',
    primaryLight: '#00B371',
    secondary: '#0068FF',
    secondaryDark: '#0052CC',
    dark: '#0B1221',
    darkLight: '#1A2332',
    success: '#059669',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Leaderboard medals
  medals: {
    gold: { color: '#FFD700', bg: '#FEF9C3', emoji: '🥇' },
    silver: { color: '#C0C0C0', bg: '#F3F4F6', emoji: '🥈' },
    bronze: { color: '#CD7F32', bg: '#FED7AA', emoji: '🥉' },
  },

  // Team configurations
  teams: [
    { id: 'Sales_Enterprise', name: 'Sales Enterprise', color: '#8B5CF6' },
    { id: 'Sales_Pro', name: 'Sales Pro', color: '#3B82F6' },
    { id: 'BDR', name: 'BDR', color: '#10B981' },
  ],
} as const;

// Avatar generation (using initials)
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate a consistent color based on name
export function getAvatarColor(name: string): string {
  const colors = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// Format date for display
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}
