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
      console.log('[AuthProvider] State:', { isAuthenticated, accountsCount: accounts.length, inProgress });
      
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
          console.log('[AuthProvider] Got idToken from MSAL, calling backend API');

          msSignIn(idToken).subscribe({
            next: (response) => {
              console.log('[AuthProvider] Backend API response received');
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
              console.log('[AuthProvider] Backend authentication successful, token stored');
            },
            error: (error) => {
              console.error('[AuthProvider] Backend sign-in failed:', error);
              toast.error('Authentication failed. Please try again.');
              storage.remove(AUTH_RESPONSE);
              instance.logoutRedirect({
                postLogoutRedirectUri: window.location.origin,
              });
            }
          });
        } catch (error) {
          console.error('[AuthProvider] Silent token acquisition failed:', error);
        }
      }
    };

    syncAuthState();
  }, [isAuthenticated, accounts, inProgress, instance, dispatch]);

  return <>{children}</>;
};
