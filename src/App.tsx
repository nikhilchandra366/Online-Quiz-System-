
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QuizProvider } from "@/context/QuizContext";
import Layout from "@/components/Layout/Layout";

// Pages
import LoginForm from "@/components/Auth/LoginForm";
import TeacherDashboard from "@/components/Teacher/TeacherDashboard";
import StudentDashboard from "@/components/Student/StudentDashboard";
import QuizCreator from "@/components/Teacher/QuizCreator";
import QuizTaker from "@/components/Student/QuizTaker";
import QuizIntro from "@/components/Student/QuizIntro";
import AttemptResults from "@/components/Student/AttemptResults";
import QuizResults from "@/components/Teacher/QuizResults";
import NotFound from "./pages/NotFound";

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
    <TooltipProvider>
      <AuthProvider>
        <QuizProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<RoleRedirect />} />

                {/* Teacher routes */}
                <Route 
                  path="/teacher-dashboard" 
                  element={
                    <ProtectedRoute allowedRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create-quiz" 
                  element={
                    <ProtectedRoute allowedRole="teacher">
                      <QuizCreator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-quiz/:quizId" 
                  element={
                    <ProtectedRoute allowedRole="teacher">
                      <QuizCreator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quiz-results/:quizId" 
                  element={
                    <ProtectedRoute allowedRole="teacher">
                      <QuizResults />
                    </ProtectedRoute>
                  } 
                />

                {/* Student routes */}
                <Route 
                  path="/student-dashboard" 
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quiz/:quizId" 
                  element={
                    <ProtectedRoute allowedRole="student">
                      <QuizIntro />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/take-quiz/:attemptId" 
                  element={
                    <ProtectedRoute allowedRole="student">
                      <QuizTaker />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/attempt-results/:attemptId" 
                  element={
                    <ProtectedRoute allowedRole="student">
                      <AttemptResults />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </QuizProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
