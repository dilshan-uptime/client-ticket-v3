import type { IPublicClientApplication } from '@azure/msal-browser';
import storage from '@/services/storage/local-storage';
import { AUTH_RESPONSE } from '@/constants/storage';
import store from '@/app/redux/store';
import { authActions } from '@/app/redux/authSlice';

export const performLogout = (msalInstance: IPublicClientApplication): void => {
  console.log('[LogoutHelper] Starting logout process...');
  
  store.dispatch(authActions.logoutUser());
  storage.remove(AUTH_RESPONSE);
  console.log('[LogoutHelper] Redux and localStorage cleared');
  
  const allAccounts = msalInstance.getAllAccounts();
  console.log(`[LogoutHelper] Found ${allAccounts.length} cached accounts`);
  
  msalInstance.setActiveAccount(null);
  console.log('[LogoutHelper] Active account cleared');
  
  console.log('[LogoutHelper] Calling logoutRedirect to clear ALL accounts from MSAL cache');
  
  msalInstance.logoutRedirect({
    postLogoutRedirectUri: `${window.location.origin}/login`,
  }).catch((error) => {
    console.error('[LogoutHelper] Logout redirect failed, forcing manual redirect:', error);
    
    store.dispatch(authActions.logoutUser());
    storage.remove(AUTH_RESPONSE);
    msalInstance.setActiveAccount(null);
    
    window.location.href = '/login';
  });
};
