import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch } from 'react-redux';
import { authActions } from '@/app/redux/authSlice';
import { metadataActions } from '@/app/redux/metadataSlice';
import { loginRequest } from '@/config/msalConfig';
import { msSignIn } from '@/services/api/auth-api';
import { getSystemMetadataAPI } from '@/services/api/metadata-api';
import { toast } from 'sonner';
import storage from '@/services/storage/local-storage';
import { AUTH_RESPONSE } from '@/constants/storage';

interface BackendAuthContextType {
  isBackendAuthReady: boolean;
  isBackendAuthLoading: boolean;
}

const BackendAuthContext = createContext<BackendAuthContextType | undefined>(undefined);

export const useBackendAuth = () => {
  const context = useContext(BackendAuthContext);
  if (!context) {
    throw new Error('useBackendAuth must be used within BackendAuthProvider');
  }
  return context;
};

interface BackendAuthProviderProps {
  children: ReactNode;
}

export const BackendAuthProvider = ({ children }: BackendAuthProviderProps) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useDispatch();
  
  const [isBackendAuthReady, setIsBackendAuthReady] = useState(false);
  const [isBackendAuthLoading, setIsBackendAuthLoading] = useState(false);
  const activeSubscriptionRef = useRef<any>(null);
  const metadataSubscriptionRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async () => {
      console.log('[BackendAuth] Sync auth state - isAuthenticated:', isAuthenticated, 'inProgress:', inProgress);
      
      // Cancel any active subscription from previous effect run
      if (activeSubscriptionRef.current) {
        console.log('[BackendAuth] Canceling previous backend request');
        activeSubscriptionRef.current.unsubscribe();
        activeSubscriptionRef.current = null;
      }
      if (metadataSubscriptionRef.current) {
        console.log('[BackendAuth] Canceling previous metadata request');
        metadataSubscriptionRef.current.unsubscribe();
        metadataSubscriptionRef.current = null;
      }
      
      // Reset states if not authenticated
      if (!isAuthenticated) {
        console.log('[BackendAuth] User not authenticated, clearing backend auth state');
        dispatch(authActions.logoutUser());
        dispatch(metadataActions.clearMetadata());
        storage.remove(AUTH_RESPONSE);
        if (isMounted) {
          setIsBackendAuthReady(false);
          setIsBackendAuthLoading(false);
        }
        return;
      }
      
      if (isAuthenticated && accounts.length > 0 && inProgress === InteractionStatus.None) {
        const existingAuth = storage.get(AUTH_RESPONSE);
        if (existingAuth && existingAuth.token) {
          console.log('[BackendAuth] Found existing backend token, syncing to Redux');
          if (isMounted) {
            dispatch(authActions.authenticateUserSuccess(existingAuth));
            
            metadataSubscriptionRef.current = getSystemMetadataAPI().subscribe({
              next: (metadata) => {
                if (!isMounted) return;
                console.log('[BackendAuth] Metadata fetched successfully (cached auth)');
                dispatch(metadataActions.setMetadata(metadata));
                metadataSubscriptionRef.current = null;
              },
              error: (metadataError) => {
                if (!isMounted) return;
                console.error('[BackendAuth] Failed to fetch metadata (cached auth):', metadataError);
                metadataSubscriptionRef.current = null;
              }
            });
            
            setIsBackendAuthReady(true);
            setIsBackendAuthLoading(false);
          }
          return;
        }

        console.log('[BackendAuth] No backend token found, calling backend with idToken');
        if (!isMounted) {
          console.log('[BackendAuth] Component unmounted, skipping backend call');
          return;
        }
        
        setIsBackendAuthLoading(true);
        const account = accounts[0];
        
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: loginRequest.scopes,
            account: account,
          });

          if (!isMounted) {
            console.log('[BackendAuth] Component unmounted after token acquisition, skipping backend call');
            return;
          }

          const idToken = tokenResponse.idToken;
          console.log('[BackendAuth] Got idToken from MSAL (length:', idToken?.length, ')');
          console.log('[BackendAuth] Calling backend API:', import.meta.env.VITE_API_URL + '/api/v1/auth/ms-sign-in');

          activeSubscriptionRef.current = msSignIn(idToken).subscribe({
            next: (response) => {
              if (!isMounted) {
                console.log('[BackendAuth] Component unmounted, ignoring backend response');
                activeSubscriptionRef.current = null;
                return;
              }
              
              console.log('[BackendAuth] Backend sign-in successful:', response);
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
              console.log('[BackendAuth] Auth data stored successfully');
              
              metadataSubscriptionRef.current = getSystemMetadataAPI().subscribe({
                next: (metadata) => {
                  if (!isMounted) {
                    console.log('[BackendAuth] Component unmounted, ignoring metadata response');
                    metadataSubscriptionRef.current = null;
                    return;
                  }
                  console.log('[BackendAuth] Metadata fetched successfully');
                  dispatch(metadataActions.setMetadata(metadata));
                  metadataSubscriptionRef.current = null;
                },
                error: (metadataError) => {
                  if (!isMounted) {
                    console.log('[BackendAuth] Component unmounted, ignoring metadata error');
                    metadataSubscriptionRef.current = null;
                    return;
                  }
                  console.error('[BackendAuth] Failed to fetch metadata:', metadataError);
                  metadataSubscriptionRef.current = null;
                }
              });
              
              setIsBackendAuthReady(true);
              setIsBackendAuthLoading(false);
              activeSubscriptionRef.current = null;
            },
            error: (error) => {
              if (!isMounted) {
                console.log('[BackendAuth] Component unmounted, ignoring error');
                activeSubscriptionRef.current = null;
                return;
              }
              
              console.error('[BackendAuth] Backend sign-in failed - Full error:', error);
              console.error('[BackendAuth] Error response:', error?.response);
              console.error('[BackendAuth] Error data:', error?.response?.data);
              console.error('[BackendAuth] Error status:', error?.response?.status);
              console.error('[BackendAuth] API URL:', import.meta.env.VITE_API_URL);
              
              const errorMessage = error?.response?.data?.message || error?.message || 'Authentication failed';
              toast.error(`Authentication failed: ${errorMessage}. Please try again.`);
              
              setIsBackendAuthReady(false);
              setIsBackendAuthLoading(false);
              activeSubscriptionRef.current = null;
              
              // Logout from MSAL on backend failure
              import('@/utils/logout-helper').then(({ performLogout }) => {
                performLogout(instance);
              }).catch((err) => {
                console.error('[BackendAuth] Logout import failed:', err);
                dispatch(authActions.logoutUser());
                dispatch(metadataActions.clearMetadata());
                storage.remove(AUTH_RESPONSE);
                window.location.href = '/login';
              });
            }
          });
        } catch (error) {
          if (isMounted) {
            console.error('[BackendAuth] Silent token acquisition failed:', error);
            setIsBackendAuthReady(false);
            setIsBackendAuthLoading(false);
          }
        }
      }
    };

    syncAuthState();

    // Cleanup function
    return () => {
      isMounted = false;
      if (activeSubscriptionRef.current) {
        console.log('[BackendAuth] Cleaning up auth subscription on unmount');
        activeSubscriptionRef.current.unsubscribe();
        activeSubscriptionRef.current = null;
      }
      if (metadataSubscriptionRef.current) {
        console.log('[BackendAuth] Cleaning up metadata subscription on unmount');
        metadataSubscriptionRef.current.unsubscribe();
        metadataSubscriptionRef.current = null;
      }
    };
  }, [isAuthenticated, accounts, inProgress, instance, dispatch]);

  return (
    <BackendAuthContext.Provider value={{ isBackendAuthReady, isBackendAuthLoading }}>
      {children}
    </BackendAuthContext.Provider>
  );
};
