import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../authSlice';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      console.error("Auth Error:", error);
      navigate('/login?error=' + error);
      return;
    }

    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        // Save user to Redux
        dispatch(setCredentials(userData));
        
        // Redirect based on role
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error("Failed to parse user data", err);
        navigate('/login');
      }
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
        <p className="mt-4 text-gray-600 font-semibold">Completing sign in...</p>
      </div>
    </div>
  );
}

export default AuthCallback;