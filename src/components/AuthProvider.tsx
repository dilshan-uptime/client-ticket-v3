import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch } from 'react-redux';
import { authActions } from '@/app/redux/authSlice';
import { loginRequest } from '@/config/msalConfig';

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
          await instance.acquireTokenSilent({
            scopes: loginRequest.scopes,
            account: account,
          });

          const authData = {
            token: '',
            refreshToken: '',
            user: {
              id: account.localAccountId,
              email: account.username,
              firstName: account.name?.split(' ')[0] || '',
              lastName: account.name?.split(' ').slice(1).join(' ') || '',
              userRole: null,
            },
          };

          dispatch(authActions.authenticateUserSuccess(authData));
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
