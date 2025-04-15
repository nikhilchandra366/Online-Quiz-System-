import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2, BarChart4, Copy, Share2 } from "lucide-react";
import { Quiz } from "@/types/quiz";
import { useQuiz } from "@/context/QuizContext";

interface QuizCardProps {
  quiz: Quiz;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewResults: (id: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onEdit, onDelete, onViewResults }) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();
  const { getQuizAttempts } = useQuiz();

  // Safely fetch stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const attempts = getQuizAttempts(quiz.id) || [];
        const completedAttempts = attempts.filter(a => a.completedAt !== null) || [];
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
  }, [quiz.id, getQuizAttempts]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quiz.code);
    toast({
      title: "Quiz code copied!",
      description: "The quiz code has been copied to clipboard.",
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md dark:border-gray-700">
      <CardHeader className="pb-3 space-y-1.5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-1">{quiz.title}</CardTitle>
          <Badge variant={quiz.isPublished ? "default" : "outline"} className={quiz.isPublished ? "bg-secondary text-secondary-foreground" : ""}>
            {quiz.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {quiz.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quiz Code:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono bg-muted px-2 py-1 rounded">{quiz.code}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
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
      <CardFooter className="border-t pt-4 flex justify-between gap-2 flex-wrap">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(quiz.id)}
            className="flex gap-1 items-center"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(quiz.id)}
            className="flex gap-1 items-center text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Delete</span>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewResults(quiz.id)}
            className="flex gap-1 items-center"
          >
            <BarChart4 className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Results</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
            className="flex gap-1 items-center"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Share</span>
          </Button>
        </div>
          
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
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
                <div className="flex">
                  <Input
                    value={quiz.code}
                    readOnly
                    className="font-mono text-center text-lg"
                  />
                  <Button 
                    variant="secondary" 
                    className="ml-2" 
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <div className="text-sm text-muted-foreground">
                Students can join using this code on the student dashboard.
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
