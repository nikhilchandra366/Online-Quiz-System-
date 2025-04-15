
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LockKeyhole, LogIn, UserCircle2, Key, Mail, BookOpen, GraduationCap } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">("student");
  const { login, register, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) {
          toast({
            title: "Error",
            description: "Please enter your name",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Additional validation for student fields
        if (role === "student") {
          if (!rollNumber.trim() || !className.trim() || !section.trim()) {
            toast({
              title: "Error",
              description: "Please fill in all required student details",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }

        // Additional validation for teacher fields
        if (role === "teacher" && !teacherId.trim()) {
          toast({
            title: "Error",
            description: "Please enter your teacher ID",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Create a user metadata object to store additional fields
        const metadata = role === "student"
          ? { name, rollNumber, class: className, section }
          : { name, teacherId };

        await register(name, email, password, role, metadata);
        toast({
          title: "Registration successful",
          description: `Welcome ${name}! You are now registered as a ${role}.`,
        });
      } else {
        await login(email, password, role);
        toast({
          title: "Login successful",
          description: `Welcome back! You are now logged in as a ${role}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account."
    });
  };

  const classOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 bg-primary text-primary-foreground rounded-t-lg pb-6">
          <CardTitle className="text-center text-2xl font-bold">
            {isRegistering ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center text-primary-foreground/80">
            {isRegistering
              ? "Sign up to create and take quizzes"
              : "Login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="student" className="mb-6" onValueChange={(value) => setRole(value as "student" | "teacher")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="student" 
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger 
                  value="teacher" 
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isRegistering && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4" /> Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-muted/50"
                  />
                </div>

                {role === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        placeholder="Enter your roll number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        required
                        className="bg-muted/50"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class">Class</Label>
                        <Select value={className} onValueChange={setClassName}>
                          <SelectTrigger id="class" className="bg-muted/50">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                Class {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="section">Section</Label>
                        <Select value={section} onValueChange={setSection}>
                          <SelectTrigger id="section" className="bg-muted/50">
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {sectionOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                Section {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {role === "teacher" && (
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Teacher ID</Label>
                    <Input
                      id="teacherId"
                      placeholder="Enter your teacher ID"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      required
                      className="bg-muted/50"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>

              <Button 
                className="w-full mt-6" 
                type="submit" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  "Processing..."
                ) : isRegistering ? (
                  <>
                    <Key className="mr-2 h-4 w-4" /> Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button
            variant="link"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-primary"
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>

      {/* Logout Confirmation */}
      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoginForm;
