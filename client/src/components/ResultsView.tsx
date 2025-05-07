import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, AlertTriangle } from "lucide-react";
import { LearningResult } from "@/lib/types";
import ShareProgress from "@/components/ShareProgress";

interface ResultsViewProps {
  results: LearningResult;
  topic: string;
  onNewTopic: () => void;
  onRetryTopic: () => void;
}

export default function ResultsView({
  results,
  topic,
  onNewTopic,
  onRetryTopic
}: ResultsViewProps) {
  const { score, scorePercentage, totalQuestions, correctAnswers, strengths, improvements, nextSteps } = results;
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary-light mb-4">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-neutral-800 mb-2">
              Your Learning Results
            </h2>
            <p className="text-neutral-600">{topic}</p>
          </div>
          
          {/* Score Display */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-700 font-medium">Your Score</span>
              <span className="text-lg font-bold text-primary">{scorePercentage}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-neutral-600 text-center">
              You answered {correctAnswers} out of {totalQuestions} questions correctly
            </div>
          </div>
          
          {/* Performance Analysis */}
          <div className="mb-8">
            <h3 className="font-heading font-medium text-lg mb-4 text-neutral-800">
              Performance Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start bg-green-50 p-4 rounded-lg">
                <div className="flex-shrink-0 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-green-800">Strengths</h4>
                  <p className="text-green-700 text-sm mt-1">{strengths}</p>
                </div>
              </div>
              
              <div className="flex items-start bg-amber-50 p-4 rounded-lg">
                <div className="flex-shrink-0 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-amber-800">Areas for Improvement</h4>
                  <p className="text-amber-700 text-sm mt-1">{improvements}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div>
            <h3 className="font-heading font-medium text-lg mb-4 text-neutral-800">
              What's Next?
            </h3>
            <div className="bg-neutral-50 p-4 rounded-lg mb-6">
              <p className="text-neutral-700">{nextSteps}</p>
            </div>
            
            <div className="flex items-center mb-4 justify-center">
              <ShareProgress 
                topic={topic}
                score={scorePercentage}
                completedAt={new Date().toISOString()}
                className="w-full sm:w-auto"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onNewTopic}
                variant="outline"
                className="flex-1 px-6 py-3 bg-white border border-primary text-primary font-medium rounded-lg hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Learn a New Topic
              </Button>
              
              <Button 
                onClick={onRetryTopic}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Retry This Topic
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
