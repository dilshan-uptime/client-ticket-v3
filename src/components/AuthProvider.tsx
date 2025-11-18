import { useEffect, useRef } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch } from 'react-redux';
import { authActions } from '@/app/redux/authSlice';
import { AUTH_RESPONSE } from '@/constants/storage';
import storage from '@/services/storage/local-storage';
import type { AuthenticationResponse } from '@/models/auth';
import { loginRequest } from '@/config/msalConfig';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useDispatch();
  const tokenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const acquireAndStoreToken = async () => {
      if (isAuthenticated && accounts.length > 0 && inProgress === InteractionStatus.None) {
        const account = accounts[0];
        
        try {
          const response = await instance.acquireTokenSilent({
            scopes: loginRequest.scopes,
            account: account,
          });

          const authData: AuthenticationResponse = {
            token: response.accessToken,
            refreshToken: response.accessToken,
            user: {
              id: account.localAccountId,
              email: account.username,
              firstName: account.name?.split(' ')[0] || '',
              lastName: account.name?.split(' ').slice(1).join(' ') || '',
              userRole: null,
            },
          };

          storage.set(AUTH_RESPONSE, authData);
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

    acquireAndStoreToken();

    if (tokenIntervalRef.current) {
      clearInterval(tokenIntervalRef.current);
    }

    tokenIntervalRef.current = setInterval(acquireAndStoreToken, 5 * 60 * 1000);

    return () => {
      if (tokenIntervalRef.current) {
        clearInterval(tokenIntervalRef.current);
      }
    };
  }, [isAuthenticated, accounts, inProgress, instance, dispatch]);

  return <>{children}</>;
};
