import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  compact?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  compact = false,
  shadow = 'md'
}) => {
  const cardClasses = [
    'card',
    'bg-base-100',
    'rounded-xl lg:rounded-2xl',
    `shadow-${shadow}`,
    compact ? 'card-compact' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="card-body p-4 lg:p-6">
        {title && <h2 className="card-title text-lg lg:text-xl">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Card;
