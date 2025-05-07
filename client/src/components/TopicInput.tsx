import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  initialTopic?: string;
}

export default function TopicInput({ onSubmit, initialTopic = "" }: TopicInputProps) {
  const [topic, setTopic] = useState(initialTopic);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white rounded-xl shadow-md overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-neutral-800 mb-3">
              What would you like to learn today?
            </h2>
            <p className="text-neutral-600 max-w-lg mx-auto">
              Enter any topic below and we'll create personalized flashcards and quizzes to help you master it.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="topicInput" className="block text-sm font-medium text-neutral-700 mb-1">
                Learning Topic
              </Label>
              <Input
                id="topicInput"
                type="text"
                placeholder="e.g., JavaScript Fundamentals, World War II, Photosynthesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Generate Learning Materials
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-neutral-500">
            <p>Powered by advanced AI to create personalized learning experiences</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
