import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, BookOpen, User, ChevronDown, Moon, Sun } from "lucide-react";
import LogoutConfirmation from "./LogoutConfirmation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/Theme/ThemeProvider";
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const {
    user,
    logout
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
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
  return <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => navigate("/")} style={{
          cursor: "pointer"
        }}>
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-bold">QuizLink</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full border-2 border-primary-foreground/20 hover:bg-primary-foreground/10 text-slate-50">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {user && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {user.name || user.email} ({user.role})
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="bg-secondary/30">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>

      <footer className="bg-muted py-4 px-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 QuizLink - Connect teachers and students through quizzes</p>
        </div>
      </footer>

      <LogoutConfirmation isOpen={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} onConfirm={confirmLogout} />
    </div>;
};
export default Layout;