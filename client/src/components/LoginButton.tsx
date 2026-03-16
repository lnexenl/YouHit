import { Activity } from 'lucide-react';

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className = '' }: LoginButtonProps) {
  const handleLogin = () => {
    window.location.href = '/auth/login';
  };

  return (
    <button
      onClick={handleLogin}
      className={`
        inline-flex items-center gap-3 px-6 py-3.5
        bg-orange-500 hover:bg-orange-600
        text-white font-semibold text-lg
        rounded-xl transition-all duration-200
        shadow-lg shadow-orange-900/20
        hover:shadow-xl hover:shadow-orange-900/30
        hover:-translate-y-0.5
        active:translate-y-0
        ${className}
      `}
    >
      <Activity className="w-5 h-5" />
      Connect Your Account
    </button>
  );
}