
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QuizProvider } from "@/context/QuizContext";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import Layout from "@/components/Layout/Layout";

// Pages
import Home from "@/pages/Home";
import LoginForm from "@/components/Auth/LoginForm";
import TeacherDashboard from "@/components/Teacher/TeacherDashboard";
import StudentDashboard from "@/components/Student/StudentDashboard";
import QuizCreator from "@/components/Teacher/QuizCreator";
import QuizTaker from "@/components/Student/QuizTaker";
import QuizIntro from "@/components/Student/QuizIntro";
import AttemptResults from "@/components/Student/AttemptResults";
import QuizResults from "@/components/Teacher/QuizResults";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Route guard for authenticated routes
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole?: "teacher" | "student"; 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return (
      <Navigate 
        to={user?.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard"} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

// Component for redirecting based on role
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (user?.role === "teacher") {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  return <Navigate to="/student-dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <QuizProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <Layout>
                    <RoleRedirect />
                  </Layout>
                } />
                
                <Route path="/home" element={
                  <Layout>
                    <Home />
                  </Layout>
                } />

                {/* Shared authenticated routes */}
                <Route 
                  path="/profile" 
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />

                {/* Teacher routes */}
                <Route 
                  path="/teacher-dashboard" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="teacher">
                        <TeacherDashboard />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/create-quiz" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="teacher">
                        <QuizCreator />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/edit-quiz/:quizId" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="teacher">
                        <QuizCreator />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/quiz-results/:quizId" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="teacher">
                        <QuizResults />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />

                {/* Student routes */}
                <Route 
                  path="/student-dashboard" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="student">
                        <StudentDashboard />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/quiz/:quizId" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="student">
                        <QuizIntro />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/take-quiz/:attemptId" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="student">
                        <QuizTaker />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/attempt-results/:attemptId" 
                  element={
                    <Layout>
                      <ProtectedRoute allowedRole="student">
                        <AttemptResults />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />

                {/* Catch-all route */}
                <Route path="*" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
              </Routes>
              <Toaster />
              <Sonner />
            </QuizProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
