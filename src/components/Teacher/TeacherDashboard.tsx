
import React, { useState, useEffect, useCallback } from "react";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSkeleton } from "./DashboardSkeleton";
import QuizAnalytics from "./QuizAnalytics";
import { QuizCard } from "./QuizCard";
import { ThemeToggle } from "../Theme/ThemeToggle";

const TeacherDashboard: React.FC = () => {
  const { quizzes, deleteQuiz, fetchQuizzes, attempts, fetchAttempts } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Memoize the fetchData function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    console.log("TeacherDashboard: Loading data, user:", user);
    
    if (!user) {
      console.log("TeacherDashboard: No user available");
      setIsLoading(false);
      return;
    }
    
    if (user.role !== 'teacher') {
      console.log("TeacherDashboard: User is not a teacher", user.role);
      setError("You must be logged in as a teacher to view this page");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("TeacherDashboard: Calling fetchQuizzes");
      await fetchQuizzes();
      await fetchAttempts();
      console.log("TeacherDashboard: Data fetch completed");
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setIsLoading(false);
    }
  }, [fetchQuizzes, fetchAttempts, user]);

  useEffect(() => {
    // Set a shorter timeout to improve perceived performance
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Filter quizzes created by the current teacher
  const teacherQuizzes = user ? quizzes.filter(quiz => quiz.createdBy === user.id) : [];
  console.log("TeacherDashboard: Filtered quizzes:", teacherQuizzes);

  // Filter by published status
  const publishedQuizzes = teacherQuizzes.filter(quiz => quiz.isPublished);
  const draftQuizzes = teacherQuizzes.filter(quiz => !quiz.isPublished);

  const handleCreateQuiz = () => {
    navigate("/create-quiz");
  };

  const handleEditQuiz = (quizId: string) => {
    navigate(`/edit-quiz/${quizId}`);
  };

  const handleViewResults = (quizId: string) => {
    navigate(`/quiz-results/${quizId}`);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteQuiz(id);
      setDeleteConfirmId(null);
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting quiz:", err);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show a more responsive loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive text-lg">{error}</p>
        <Button onClick={() => fetchData()}>Retry</Button>
      </div>
    );
  }

  const displayQuizzes = () => {
    if (activeTab === "published") return publishedQuizzes;
    if (activeTab === "drafts") return draftQuizzes;
    return teacherQuizzes;
  };

  const currentQuizzes = displayQuizzes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground">Manage your quizzes and track student progress</p>
        </div>
        <Button 
          onClick={handleCreateQuiz} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Quiz
        </Button>
      </div>

      <QuizAnalytics quizzes={teacherQuizzes} attempts={attempts} />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({teacherQuizzes.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedQuizzes.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftQuizzes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {currentQuizzes.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground mb-4">
                  You haven't created any quizzes yet.
                </p>
                <Button onClick={handleCreateQuiz} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentQuizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={handleEditQuiz}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-0">
          {currentQuizzes.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground mb-4">
                  You don't have any published quizzes yet.
                </p>
                <Button onClick={handleCreateQuiz} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create a New Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentQuizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={handleEditQuiz}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="mt-0">
          {currentQuizzes.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground mb-4">
                  You don't have any draft quizzes.
                </p>
                <Button onClick={handleCreateQuiz} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create a New Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentQuizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={handleEditQuiz}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone
              and all student attempts will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && handleConfirmDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
