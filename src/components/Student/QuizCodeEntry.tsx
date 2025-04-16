
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/context/QuizContext";

const QuizCodeEntry: React.FC = () => {
  const [quizCode, setQuizCode] = useState("");
  const { getQuizByCode } = useQuiz();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz code",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const quiz = await getQuizByCode(quizCode.trim());
      
      if (quiz) {
        navigate(`/quiz/${quiz.id}`);
      } else {
        toast({
          title: "Invalid Quiz Code",
          description: "No active quiz found with this code. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Quiz Code</CardTitle>
        <CardDescription>Enter the code provided by your teacher to access the quiz</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitCode} className="flex gap-2">
          <Input 
            placeholder="Enter quiz code (e.g., MATH01)" 
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
            className="uppercase"
            maxLength={6}
          />
          <Button type="submit">Start Quiz</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuizCodeEntry;
