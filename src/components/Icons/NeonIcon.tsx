import { motion } from 'framer-motion';
import { Home, Archive, Info, User, Wallet, Ticket } from 'lucide-react';

export type IconType = 'home' | 'archive' | 'about' | 'profile' | 'wallet' | 'ticket';

interface NeonIconProps {
  icon: IconType;
  active?: boolean;
  size?: number;
  className?: string;
}

const iconMap = {
  home: Home,
  archive: Archive,
  about: Info,
  profile: User,
  wallet: Wallet,
  ticket: Ticket,
};

export default function NeonIcon({ icon, active = false, size = 24, className = '' }: NeonIconProps) {
  const IconComponent = iconMap[icon];

  return (
    <motion.div
      className={`neon-icon ${active ? 'active' : ''} ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        filter: active
          ? 'drop-shadow(0 0 8px var(--neon-primary))'
          : 'drop-shadow(0 0 0px transparent)',
        transition: 'filter 0.3s ease',
      }}
    >
      <IconComponent
        size={size}
        color={active ? 'var(--neon-primary)' : '#ffffff'}
        strokeWidth={active ? 2.5 : 2}
      />
    </motion.div>
  );
}
