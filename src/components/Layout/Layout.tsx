
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, BookOpen, User, ChevronDown, Moon, Sun, Home, BarChart2 } from "lucide-react";
import LogoutConfirmation from "./LogoutConfirmation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/Theme/ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          <div 
            className="flex items-center gap-2" 
            onClick={() => navigate(isAuthenticated ? (user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard") : "/home")} 
            style={{ cursor: "pointer" }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">QuizLink</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigate("/home")}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            
            {isAuthenticated && (
              <button 
                onClick={() => navigate(user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard")}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition"
              >
                <BarChart2 className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? 
                <Sun className="h-5 w-5 text-yellow-500" /> : 
                <Moon className="h-5 w-5 text-indigo-500" />
              }
            </Button>
            
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")} 
                  className="font-medium"
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  className="bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  Register
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 font-medium border-2 hover:bg-accent">
                    <User className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">
                      {user.name || user.email} 
                    </span>
                    <span className="hidden sm:inline text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {user.role}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>

      <footer className="border-t border-border py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-semibold">QuizLink</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 QuizLink - Connect teachers and students through quizzes
            </div>
            
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/home")}>
                Home
              </Button>
              {isAuthenticated && (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate(user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard")}>
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      <LogoutConfirmation isOpen={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} onConfirm={confirmLogout} />
    </div>
  );
};

export default Layout;
