interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  className?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'medium', 
  text,
  className = '',
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-3',
    large: 'h-16 w-16 border-4',
  };

  const content = (
    <div className={`flex flex-col justify-center items-center ${className}`}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-purple-200 ${sizeClasses[size]}`}>
          <div className="absolute inset-0 rounded-full border-t-purple-600 border-l-purple-600 border-r-transparent border-b-transparent" 
               style={{ borderWidth: 'inherit' }}></div>
        </div>
      </div>
      {text && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}