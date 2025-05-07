import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { MCQQuestion } from "@/lib/types";

interface MCQViewProps {
  questions: MCQQuestion[];
  currentIndex: number;
  onSubmit: (answerIndex: string) => void;
  initialTime: number;
  onTimeUpdate: (time: number) => void;
  onTimeEnd: () => void;
  onSaveForLater: () => void;
}

export default function MCQView({
  questions,
  currentIndex,
  onSubmit,
  initialTime,
  onTimeUpdate,
  onTimeEnd,
  onSaveForLater
}: MCQViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  
  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentIndex]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        onTimeUpdate(newTime);
        
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeEnd();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTimeUpdate, onTimeEnd]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  
  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onSubmit(selectedAnswer);
    }
  };
  
  const currentQuestion = questions[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header with Timer and Progress */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="text-neutral-700 mb-4 sm:mb-0">
          <span className="font-medium">{currentIndex + 1}</span> of{" "}
          <span>{questions.length}</span> questions
        </div>
        
        <div className="flex items-center bg-neutral-100 px-4 py-2 rounded-full">
          <Clock className="text-neutral-600 mr-2 h-5 w-5" />
          <span className="font-medium text-neutral-700">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      
      {/* Question Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-heading font-bold text-xl mb-5 text-neutral-800">
              {currentQuestion.question}
            </h3>
            
            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => {
                const optionValue = String.fromCharCode(65 + index); // A, B, C, D...
                
                return (
                  <div 
                    key={index}
                    className="flex items-start p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <RadioGroupItem 
                      value={optionValue} 
                      id={`option-${optionValue}`}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <Label
                      htmlFor={`option-${optionValue}`}
                      className="ml-3 text-neutral-700 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>
      
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={onSaveForLater}
          variant="outline"
          className="px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Take Quiz Later
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}
