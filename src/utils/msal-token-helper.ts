import { msalInstance } from '@/config/msalInstance';
import { loginRequest } from '@/config/msalConfig';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import type { AuthenticationResponse } from '@/models/auth';

export class LoginRedirectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginRedirectError';
  }
}

export const getAccessToken = async (): Promise<string> => {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length === 0) {
    await msalInstance.loginRedirect(loginRequest);
    throw new LoginRedirectError('No accounts found, initiating login redirect');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: loginRequest.scopes,
      account: accounts[0],
    });
    
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      console.log('Interaction required, initiating login redirect');
      await msalInstance.loginRedirect(loginRequest);
      throw new LoginRedirectError('Interaction required, initiating login redirect');
    }
    
    throw error;
  }
};

export const getUserDataFromMsal = (): AuthenticationResponse | null => {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length === 0) {
    return null;
  }

  const account = accounts[0];
  
  return {
    token: '',
    refreshToken: '',
    user: {
      id: undefined,
      email: account.username,
      firstName: account.name?.split(' ')[0] || '',
      lastName: account.name?.split(' ').slice(1).join(' ') || '',
    },
  };
};
