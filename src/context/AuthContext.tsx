
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { AppUser, UserRole } from "@/types/quiz";

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole, metadata?: Record<string, any>) => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("AuthStateChange event:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // First set basic user info
          const initialUser: AppUser = {
            ...currentSession.user,
            role: undefined,
            name: undefined
          };
          setUser(initialUser);
          
          if (event === 'SIGNED_IN') {
            // Fetch user profile data
            setTimeout(async () => {
              try {
                console.log("Fetching user profile data");
                const { data, error } = await supabase
                  .from('profiles')
                  .select('name, role, metadata')
                  .eq('id', currentSession.user.id)
                  .maybeSingle(); // Use maybeSingle to handle potential no-data cases
                  
                if (error) {
                  console.error('Error fetching user profile:', error);
                  return;
                }
                
                if (data) {
                  console.log("Profile data received:", data);
                  // Ensure role is valid
                  const userRole = data.role as UserRole;
                  if (userRole !== 'teacher' && userRole !== 'student') {
                    console.error('Invalid user role:', data.role);
                  }
                  
                  setUser(prev => {
                    if (!prev) return null;
                    return { 
                      ...prev, 
                      name: data.name || undefined,
                      role: userRole || undefined,
                      metadata: data.metadata || {}
                    };
                  });
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            }, 0);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("AuthProvider: Checking for existing session");
      setSession(currentSession);
      
      if (currentSession?.user) {
        // First set basic user info
        const initialUser: AppUser = {
          ...currentSession.user,
          role: undefined,
          name: undefined
        };
        setUser(initialUser);
        
        // Fetch user profile data
        supabase
          .from('profiles')
          .select('name, role, metadata')
          .eq('id', currentSession.user.id)
          .maybeSingle() // Use maybeSingle to handle potential no-data cases
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
              setIsLoading(false);
              return;
            }
            
            if (data) {
              console.log("Profile data received:", data);
              // Ensure role is valid
              const userRole = data.role as UserRole;
              if (userRole !== 'teacher' && userRole !== 'student') {
                console.error('Invalid user role:', data.role);
              }
              
              setUser(prev => {
                if (!prev) return null;
                return { 
                  ...prev, 
                  name: data.name || undefined,
                  role: userRole || undefined,
                  metadata: data.metadata || {}
                };
              });
            }
            
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }

      // Profile data will be fetched by the onAuthStateChange listener
      
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole, metadata: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            metadata
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Profile will be created automatically by the database trigger

    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!user.role,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
