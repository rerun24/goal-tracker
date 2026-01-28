import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'success' | 'highlight';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padding = 'md', variant = 'default', hover = false, children, ...props }, ref) => {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variants = {
      default: 'bg-white border border-gray-100',
      gradient: 'bg-gradient-to-br from-white to-gray-50/50 border border-gray-100',
      success: 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200',
      highlight: 'bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-200',
    };

    const hoverStyles = hover
      ? 'hover:shadow-soft-lg hover:border-gray-200 hover:-translate-y-0.5 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-2xl shadow-soft transition-all duration-300 ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
