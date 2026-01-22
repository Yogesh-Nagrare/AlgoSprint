import { FcGoogle } from 'react-icons/fc';

function GoogleAuthButton({ type = 'user', isLoading = false }) {
  const handleGoogleAuth = () => {
    // Replace with your backend URL from .env
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const endpoint = type === 'admin' 
      ? `${baseUrl}/auth/google/admin`
      : `${baseUrl}/auth/google/user`;
    
    // Redirect the entire window to the backend
    window.location.href = endpoint;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full py-2 bg-white hover:bg-gray-200 text-gray-700 shadow rounded-lg transition-all disabled:opacity-60"
    >
      <FcGoogle size={20} />
      {type === 'admin' ? 'Admin Sign in with Google' : 'Continue with Google'}
    </button>
  );
}

export default GoogleAuthButton;