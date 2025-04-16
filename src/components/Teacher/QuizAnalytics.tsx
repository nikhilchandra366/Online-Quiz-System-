
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Quiz, QuizAttempt } from '@/types/quiz';

interface QuizAnalyticsProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
}

const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({ quizzes, attempts }) => {
  // Calculate completion rates
  const completionData = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
    const completedAttempts = quizAttempts.filter(a => a.completedAt);
    const avgScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
      : 0;
    
    return {
      name: quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title,
      fullName: quiz.title,
      attempts: quizAttempts.length,
      completed: completedAttempts.length,
      avgScore: Math.round(avgScore)
    };
  });

  if (completionData.length === 0) {
    // Generate sample data if no real data exists
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Quiz Performance Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Sample data shown below - create quizzes to see real analytics</p>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ChartContainer 
              config={{
                attempts: { theme: { light: "#9b87f5", dark: "#9b87f5" } },
                completed: { theme: { light: "#33C3F0", dark: "#33C3F0" } },
                avgScore: { theme: { light: "#6E59A5", dark: "#D6BCFA" } }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: 'Chemistry 101', fullName: 'Chemistry 101', attempts: 32, completed: 28, avgScore: 76 },
                    { name: 'Math Quiz', fullName: 'Math Quiz', attempts: 45, completed: 40, avgScore: 82 },
                    { name: 'Biology Basics', fullName: 'Biology Basics', attempts: 38, completed: 35, avgScore: 79 },
                    { name: 'Physics Test', fullName: 'Physics Test', attempts: 25, completed: 20, avgScore: 68 },
                    { name: 'History Review', fullName: 'History Review', attempts: 42, completed: 39, avgScore: 85 }
                  ]} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--muted-foreground)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--muted-foreground)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <ChartTooltip 
                    cursor={{ fill: 'var(--muted-foreground)', opacity: 0.1 }}
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)'
                    }}
                  />
                  <Legend 
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Bar 
                    dataKey="attempts" 
                    name="Total Attempts" 
                    fill="var(--color-attempts)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="completed" 
                    name="Completed" 
                    fill="var(--color-completed)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    name="Average Score %" 
                    fill="var(--color-avgScore)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Quiz Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ChartContainer 
            config={{
              attempts: { theme: { light: "#9b87f5", dark: "#9b87f5" } },
              completed: { theme: { light: "#33C3F0", dark: "#33C3F0" } },
              avgScore: { theme: { light: "#6E59A5", dark: "#D6BCFA" } }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={completionData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--muted-foreground)' }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  tick={{ fill: 'var(--muted-foreground)' }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <ChartTooltip 
                  cursor={{ fill: 'var(--muted-foreground)', opacity: 0.1 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)'
                  }}
                  formatter={(value, name, props) => {
                    if (name === "Total Attempts" || name === "Completed") {
                      return [`${value} students`, name];
                    }
                    return [`${value}%`, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: '10px' }}
                />
                <Bar 
                  dataKey="attempts" 
                  name="Total Attempts" 
                  fill="var(--color-attempts)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="completed" 
                  name="Completed" 
                  fill="var(--color-completed)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="avgScore" 
                  name="Average Score %" 
                  fill="var(--color-avgScore)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizAnalytics;
