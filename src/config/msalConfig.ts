import { LogLevel } from '@azure/msal-browser';
import type { Configuration } from '@azure/msal-browser';

console.log('[MSAL Config] Environment variables:');
console.log('  VITE_CLIENT_ID:', import.meta.env.VITE_CLIENT_ID);
console.log('  VITE_TENANT_ID:', import.meta.env.VITE_TENANT_ID);
console.log('  VITE_REDIRECT_URI:', import.meta.env.VITE_REDIRECT_URI);
console.log('  window.location.origin:', window.location.origin);

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};
