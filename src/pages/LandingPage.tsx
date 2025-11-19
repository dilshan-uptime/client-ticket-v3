import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/msalConfig';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, Shield, Zap, Clock } from 'lucide-react';
import logo from '@/assets/logo.png';

export const LandingPage = () => {
  const { instance } = useMsal();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to sign in. Please try again.');
      setIsSigningIn(false);
    }
  };

  const features = [
    { icon: Zap, title: 'Real-time Tracking', description: 'Monitor tickets instantly' },
    { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security' },
    { icon: Clock, title: 'Always Available', description: '99.9% uptime guarantee' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ee754e]/5 via-white to-[#1fb6a6]/5">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="relative">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[calc(100vh-6rem)]">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-block">
                <img 
                  src={logo} 
                  alt="Uptime" 
                  className="h-16 lg:h-20 w-auto mx-auto lg:mx-0"
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Welcome to
                  <span className="block bg-gradient-to-r from-[#ee754e] to-[#f49b71] bg-clip-text text-transparent">
                    Uptime
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Streamline your ticket management with our powerful, intuitive platform. 
                  Track, manage, and resolve tickets faster than ever.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex flex-col items-center lg:items-start gap-3 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#ee754e] to-[#f49b71]">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1 text-center lg:text-left">
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 max-w-md w-full">
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 space-y-8 border border-border/50">
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ee754e]/10 to-[#f49b71]/10 rounded-full">
                    <CheckCircle className="h-4 w-4 text-[#ee754e]" />
                    <span className="text-sm font-medium text-[#ee754e]">Secure Authentication</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Sign in to continue</h2>
                  <p className="text-muted-foreground">
                    Use your Microsoft account for secure access
                  </p>
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-[#ee754e] to-[#f49b71] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {isSigningIn ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                          <path d="M11 0H0V11H11V0Z" fill="#F25022"/>
                          <path d="M23 0H12V11H23V0Z" fill="#7FBA00"/>
                          <path d="M11 12H0V23H11V12Z" fill="#00A4EF"/>
                          <path d="M23 12H12V23H23V12Z" fill="#FFB900"/>
                        </svg>
                        <span>Sign in with Microsoft</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-muted-foreground">
                      Powered by Microsoft Azure
                    </span>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground leading-relaxed">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-[#ee754e] hover:underline font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#ee754e] hover:underline font-medium">Privacy Policy</a>
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Need help? <a href="#" className="text-[#ee754e] hover:underline font-medium">Contact Support</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
