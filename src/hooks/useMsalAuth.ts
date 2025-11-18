import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch } from 'react-redux';
import { authActions } from '@/app/redux/authSlice';
import { AUTH_RESPONSE } from '@/constants/storage';
import storage from '@/services/storage/local-storage';
import type { AuthenticationResponse } from '@/models/auth';

export const useMsalAuth = () => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0 && inProgress === InteractionStatus.None) {
      const account = accounts[0];
      
      instance
        .acquireTokenSilent({
          scopes: ['User.Read'],
          account: account,
        })
        .then((response) => {
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
        })
        .catch((error) => {
          console.error('Token acquisition failed:', error);
        });
    }
  }, [isAuthenticated, accounts, inProgress, instance, dispatch]);

  return {
    isAuthenticated,
    account: accounts[0],
    inProgress,
  };
};
