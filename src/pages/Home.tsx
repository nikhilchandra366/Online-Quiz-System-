
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Learning, Reimagined
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Modern Quiz Platform for Teachers and Students
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Create engaging quizzes, track student progress, and improve learning outcomes with QuizLink's intuitive quiz platform.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleGetStarted} 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Get Started
              </Button>
              
              {!isAuthenticated && (
                <Button 
                  onClick={handleLogin} 
                  variant="outline" 
                  size="lg" 
                  className="border-2"
                >
                  Log In
                </Button>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative rounded-xl overflow-hidden border-2 border-muted p-2 bg-card shadow-xl">
              <div className="space-y-3">
                <div className="h-4 bg-muted/50 rounded-full w-3/4"></div>
                <div className="h-4 bg-muted/50 rounded-full"></div>
                <div className="h-4 bg-muted/50 rounded-full w-5/6"></div>
                <div className="h-4 bg-muted/50 rounded-full w-2/3"></div>
                <div className="mt-6 flex gap-3">
                  <div className="h-8 bg-primary/20 rounded-md w-24"></div>
                  <div className="h-8 bg-muted/30 rounded-md w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and analyze quizzes in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Intuitive Quiz Creation</h3>
              <p className="text-muted-foreground">
                Create custom quizzes with multiple question types, time limits, and auto-grading options.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Seamless Quiz Sharing</h3>
              <p className="text-muted-foreground">
                Share quizzes with a unique code or direct link for easy student access.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 1.8-.7l.5-.7a2.2 2.2 0 0 0-.4-3.1l-1.1-.7a3.3 3.3 0 0 0-3.2 0L8 11"></path><path d="M6 12V8.8l-1.5-.2a2 2 0 0 1-1.4-1l-.3-.6a2.2 2.2 0 0 1 .8-2.9l1-.6a3.3 3.3 0 0 1 3.1-.1L8 3.5"></path><path d="m7 3 5 2.8a2.6 2.6 0 0 0 3.4-.1l.6-.6c.4-.4.2-1-.3-1.2L11 2"></path><path d="m11 21 5.5-3a2.6 2.6 0 0 1 3.3.5l.5.5c.4.4.2 1.1-.3 1.3L11 23"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Students receive immediate results with detailed explanations of correct answers.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"></path><path d="m18 17-3-3-4 4-3-3"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Analytics</h3>
              <p className="text-muted-foreground">
                Track student performance with detailed analytics and visual reports.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle><path d="M10 15H6a4 4 0 0 0-4 4v2h9.5"></path><path d="m21.7 16.4-.9-.3"></path><path d="m15.2 13.9-.9-.3"></path><path d="m16.6 18.7.3-.9"></path><path d="m19.1 12.2.3-.9"></path><path d="m19.6 18.7-.4-1"></path><path d="m16.8 12.3-.4-1"></path><path d="m14.3 16.6 1-.4"></path><path d="m20.7 13.8 1-.4"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Separate User Portals</h3>
              <p className="text-muted-foreground">
                Dedicated interfaces for teachers and students with role-specific features.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M8 13h8"></path><path d="M8 9h3"></path><path d="M8 17h5"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quiz History</h3>
              <p className="text-muted-foreground">
                Review past quizzes and track improvement over time with comprehensive history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your classroom?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of educators and students already using QuizLink to enhance learning outcomes.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/')} 
              className="bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              Teacher Sign Up
            </Button>
            
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              size="lg"
              className="border-2"
            >
              Student Sign Up
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
