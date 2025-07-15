export default function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-primary-500 ${sizeClasses[size]}`}></div>
    </div>
  );
}