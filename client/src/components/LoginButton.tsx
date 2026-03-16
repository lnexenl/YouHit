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
      className={`transition-transform hover:scale-105 active:scale-100 ${className}`}
    >
      <img
        src="/strava-connect.svg"
        alt="Connect with Strava"
        className="h-12"
      />
    </button>
  );
}