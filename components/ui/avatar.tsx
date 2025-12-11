import { HTMLAttributes, forwardRef } from 'react';
import { getInitials, getAvatarColor } from '@/config/branding';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = '', name, size = 'md', src, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
    };

    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    if (src) {
      return (
        <div
          ref={ref}
          className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizes[size]} ${className}`}
          {...props}
        >
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center rounded-full font-medium text-white ${sizes[size]} ${className}`}
        style={{ backgroundColor: bgColor }}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
