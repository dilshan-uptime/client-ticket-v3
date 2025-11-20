import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch } from 'react-redux';
import { authActions } from '@/app/redux/authSlice';
import { loginRequest } from '@/config/msalConfig';
import { msSignIn } from '@/services/api/auth-api';
import { toast } from 'sonner';
import storage from '@/services/storage/local-storage';
import { AUTH_RESPONSE } from '@/constants/storage';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useDispatch();

  useEffect(() => {
    const syncAuthState = async () => {
      console.log('[AuthProvider] Sync auth state - isAuthenticated:', isAuthenticated, 'inProgress:', inProgress);
      
      if (isAuthenticated && accounts.length > 0 && inProgress === InteractionStatus.None) {
        const existingAuth = storage.get(AUTH_RESPONSE);
        if (existingAuth && existingAuth.token) {
          console.log('[AuthProvider] Found existing backend token, syncing to Redux');
          dispatch(authActions.authenticateUserSuccess(existingAuth));
          return;
        }

        console.log('[AuthProvider] No backend token found, calling backend with idToken');
        const account = accounts[0];
        
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: loginRequest.scopes,
            account: account,
          });

          const idToken = tokenResponse.idToken;
          console.log('[AuthProvider] Got idToken from MSAL (length:', idToken?.length, ')');
          console.log('[AuthProvider] Calling backend API:', import.meta.env.VITE_API_URL + '/api/v1/auth/ms-sign-in');

          msSignIn(idToken).subscribe({
            next: (response) => {
              console.log('[AuthProvider] Backend sign-in successful:', response);
              const authData = {
                token: response.token,
                refreshToken: response.refreshToken,
                user: {
                  id: response.user.id,
                  autoTaskId: response.user.autoTaskId,
                  email: response.user.email,
                  firstName: response.user.firstName,
                  lastName: response.user.lastName,
                  roleId: response.user.roleId,
                  roleCode: response.user.roleCode,
                  teamId: response.user.teamId,
                },
              };

              storage.set(AUTH_RESPONSE, authData);
              dispatch(authActions.authenticateUserSuccess(authData));
              console.log('[AuthProvider] Auth data stored successfully');
            },
            error: (error) => {
              console.error('[AuthProvider] Backend sign-in failed - Full error:', error);
              console.error('[AuthProvider] Error response:', error?.response);
              console.error('[AuthProvider] Error data:', error?.response?.data);
              console.error('[AuthProvider] Error status:', error?.response?.status);
              console.error('[AuthProvider] API URL:', import.meta.env.VITE_API_URL);
              
              const errorMessage = error?.response?.data?.message || error?.message || 'Authentication failed';
              toast.error(`Authentication failed: ${errorMessage}. Please check console for details.`);
              
              storage.remove(AUTH_RESPONSE);
              
              console.warn('[AuthProvider] Not logging out immediately - check backend API configuration');
            }
          });
        } catch (error) {
          console.error('Silent token acquisition failed:', error);
        }
      }
    };

    syncAuthState();
  }, [isAuthenticated, accounts, inProgress, instance, dispatch]);

  return <>{children}</>;
};
