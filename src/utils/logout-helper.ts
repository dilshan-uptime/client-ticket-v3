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
  
  const activeAccount = msalInstance.getActiveAccount();
  const allAccounts = msalInstance.getAllAccounts();
  const accountToLogout = activeAccount || (allAccounts.length > 0 ? allAccounts[0] : null);
  
  console.log(`[LogoutHelper] Found ${allAccounts.length} cached accounts`);
  
  if (accountToLogout) {
    console.log('[LogoutHelper] Logging out account:', accountToLogout.username);
    
    msalInstance.logoutRedirect({
      account: accountToLogout,
      logoutHint: accountToLogout.username,
      postLogoutRedirectUri: `${window.location.origin}/login`,
    }).catch((error) => {
      console.error('[LogoutHelper] Logout redirect failed, forcing manual redirect:', error);
      
      store.dispatch(authActions.logoutUser());
      storage.remove(AUTH_RESPONSE);
      msalInstance.setActiveAccount(null);
      
      window.location.href = '/login';
    });
  } else {
    console.log('[LogoutHelper] No accounts found, clearing active account and redirecting');
    msalInstance.setActiveAccount(null);
    window.location.href = '/login';
  }
};
