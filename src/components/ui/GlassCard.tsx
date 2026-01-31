import React from 'react';
import './GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hot' | 'cold';
  fullWidth?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  fullWidth = false 
}) => {
  const variantClass = variant !== 'default' ? `glass-card-${variant}` : '';
  const widthClass = fullWidth ? 'full-width-card' : '';
  
  return (
    <div className={`glass-card ${variantClass} ${widthClass} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
