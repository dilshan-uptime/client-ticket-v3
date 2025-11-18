import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/msalConfig';
import logo from '@/assets/logo.png';

export const LandingPage = () => {
  const { instance } = useMsal();

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="Uptime Logo" 
              className="h-16 w-auto"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Uptime
            </h1>
            <p className="text-gray-600">
              Sign in with your Microsoft account to continue
            </p>
          </div>

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 23 23" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11 0H0V11H11V0Z" fill="#F25022"/>
              <path d="M23 0H12V11H23V0Z" fill="#7FBA00"/>
              <path d="M11 12H0V23H11V12Z" fill="#00A4EF"/>
              <path d="M23 12H12V23H23V12Z" fill="#FFB900"/>
            </svg>
            <span className="text-gray-700 font-medium group-hover:text-gray-900">
              Sign in with Microsoft
            </span>
          </button>

          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
