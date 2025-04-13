import React, { useState, useEffect } from "react";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Eye, Share2, BarChart4 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const TeacherDashboard: React.FC = () => {
  const { quizzes, deleteQuiz, getQuizAttempts, fetchQuizzes } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizToShare, setQuizToShare] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log("TeacherDashboard: Loading data, user:", user);
      setIsLoading(true);
      try {
        await fetchQuizzes();
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchQuizzes, user]);

  console.log("TeacherDashboard: Current quizzes:", quizzes);
  console.log("TeacherDashboard: Current user:", user);
  console.log("TeacherDashboard: Loading state:", isLoading);

  // Filter quizzes created by the current teacher
  const teacherQuizzes = user ? quizzes.filter(quiz => quiz.createdBy === user.id) : [];
  console.log("TeacherDashboard: Filtered quizzes:", teacherQuizzes);

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
    await deleteQuiz(id);
    setDeleteConfirmId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading your quizzes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <Button onClick={handleCreateQuiz}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Quiz
        </Button>
      </div>

      {teacherQuizzes.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <p className="text-lg text-muted-foreground mb-4">
              You haven't created any quizzes yet.
            </p>
            <Button onClick={handleCreateQuiz}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherQuizzes.map((quiz) => {
            // Use a state object to store stats
            const [stats, setStats] = useState({
              total: 0,
              completed: 0,
              avgScore: 0
            });
            
            // Fetch stats when card renders
            useEffect(() => {
              const fetchStats = async () => {
                try {
                  const attempts = getQuizAttempts(quiz.id);
                  const completedAttempts = attempts.filter(a => a.completedAt !== null);
                  const avgScore = completedAttempts.length > 0
                    ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
                    : 0;
                  
                  setStats({
                    total: attempts.length,
                    completed: completedAttempts.length,
                    avgScore: Math.round(avgScore)
                  });
                } catch (error) {
                  console.error("Error fetching stats:", error);
                }
              };

              fetchStats();
            }, [quiz.id]);
            
            return (
              <Card key={quiz.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <Badge variant={quiz.isPublished ? "default" : "outline"}>
                      {quiz.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {quiz.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quiz Code:</span>
                      <span className="font-mono bg-muted px-2 py-1 rounded">
                        {quiz.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Questions:</span>
                      <span>{quiz.questions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attempts:</span>
                      <span>{stats.total} ({stats.completed} completed)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Score:</span>
                      <span>
                        {stats.completed > 0 ? `${stats.avgScore}%` : "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuiz(quiz.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(quiz.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResults(quiz.id)}
                    >
                      <BarChart4 className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuizToShare(quiz.id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share Quiz</DialogTitle>
                          <DialogDescription>
                            Share this quiz code with your students.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 my-4">
                          <div className="grid flex-1 gap-2">
                            <p className="text-sm font-medium">Quiz Code</p>
                            <Input
                              value={quiz.code}
                              readOnly
                              className="font-mono text-center text-lg"
                            />
                          </div>
                        </div>
                        <DialogFooter className="sm:justify-start">
                          <div className="text-sm text-muted-foreground">
                            Students can join using this code on the student dashboard.
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
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
