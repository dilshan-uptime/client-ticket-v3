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
      if (isAuthenticated && accounts.length > 0 && inProgress === InteractionStatus.None) {
        const account = accounts[0];
        
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: loginRequest.scopes,
            account: account,
          });

          const idToken = tokenResponse.idToken;

          msSignIn(idToken).subscribe({
            next: (response) => {
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
            },
            error: (error) => {
              console.error('Backend sign-in failed:', error);
              toast.error('Authentication failed. Please try again.');
              instance.logoutRedirect({
                postLogoutRedirectUri: window.location.origin,
              });
            }
          });
        } catch (error) {
          console.error('Silent token acquisition failed:', error);
          try {
            await instance.loginRedirect(loginRequest);
          } catch (loginError) {
            console.error('Login redirect failed:', loginError);
          }
        }
      }
    };

    syncAuthState();
  }, [isAuthenticated, accounts, inProgress, instance, dispatch]);

  return <>{children}</>;
};
