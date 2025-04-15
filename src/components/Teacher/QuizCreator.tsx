import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuiz } from "@/context/QuizContext";
import { QuizQuestion } from "@/types/quiz"; 
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Save, ArrowLeft, FileQuestion, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const generateQuizCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const QuizCreator: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { quizzes, createQuiz, updateQuiz } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEditing = !!quizId;
  const existingQuiz = isEditing ? quizzes.find(q => q.id === quizId) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCode, setQuizCode] = useState("");

  useEffect(() => {
    if (existingQuiz) {
      setTitle(existingQuiz.title);
      setDescription(existingQuiz.description);
      setQuestions([...existingQuiz.questions]);
      setIsPublished(existingQuiz.isPublished);
      setQuizCode(existingQuiz.code);
    } else {
      setQuestions([
        {
          id: Math.random().toString(36).substring(2, 9),
          text: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ]);
      
      setQuizCode(generateQuizCode());
    }
  }, [existingQuiz]);

  const checkQuizCodeUniqueness = async (code: string): Promise<boolean> => {
    if (isEditing && existingQuiz?.code === code) {
      return true;
    }
    
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('code', code)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking quiz code uniqueness:', error);
        return false;
      }
      
      return !data;
    } catch (error) {
      console.error('Error checking quiz code uniqueness:', error);
      return false;
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(36).substring(2, 9),
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "A quiz must have at least one question",
        variant: "destructive",
      });
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = text;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  const handleQuizCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 6) {
      setQuizCode(value);
    }
  };

  const regenerateQuizCode = () => {
    setQuizCode(generateQuizCode());
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your quiz",
        variant: "destructive",
      });
      return;
    }

    if (!quizCode.trim() || quizCode.length < 4) {
      toast({
        title: "Invalid quiz code",
        description: "Please provide a valid quiz code (at least 4 characters)",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.text.trim()) {
        toast({
          title: "Empty question",
          description: `Question ${i + 1} needs a question text`,
          variant: "destructive",
        });
        return;
      }
      
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].trim()) {
          toast({
            title: "Empty option",
            description: `Option ${j + 1} for question ${i + 1} is empty`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const isCodeUnique = await checkQuizCodeUniqueness(quizCode);
      
      if (!isCodeUnique) {
        toast({
          title: "Quiz code already exists",
          description: "Please choose a different quiz code or generate a new one",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (isEditing && existingQuiz) {
        updateQuiz(existingQuiz.id, {
          title,
          description,
          questions,
          isPublished,
          code: quizCode,
        });
        toast({
          title: "Quiz updated",
          description: "Your quiz has been successfully updated",
        });
      } else {
        if (!user) return;
        
        createQuiz({
          title,
          description,
          createdBy: user.id,
          questions,
          isPublished,
          code: quizCode,
        });
        toast({
          title: "Quiz created",
          description: "Your quiz has been successfully created",
        });
      }
      
      navigate("/teacher-dashboard");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: "Failed to save the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/teacher-dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="publish"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="publish">
            {isPublished ? "Published" : "Draft"}
          </Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter quiz description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quizCode">Quiz Code (for students to join)</Label>
            <div className="flex gap-2">
              <Input
                id="quizCode"
                placeholder="Enter quiz code"
                value={quizCode}
                onChange={handleQuizCodeChange}
                className="font-mono uppercase"
                maxLength={6}
              />
              <Button type="button" variant="outline" onClick={regenerateQuizCode}>
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              A unique code for students to access this quiz. 4-6 characters recommended.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button onClick={handleAddQuestion}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, questionIndex) => (
          <Card key={question.id} className="question-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveQuestion(questionIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`question-${questionIndex}`}>Question Text</Label>
                <Textarea
                  id={`question-${questionIndex}`}
                  placeholder="Enter your question"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionTextChange(questionIndex, e.target.value)
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Answer Options</Label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                    />
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        id={`correct-${question.id}-${optionIndex}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() =>
                          handleCorrectAnswerChange(questionIndex, optionIndex)
                        }
                        className="mr-2"
                      />
                      <Label htmlFor={`correct-${question.id}-${optionIndex}`}>
                        Correct
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              No questions yet. Click 'Add Question' to start building your quiz.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update Quiz" : "Create Quiz"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
