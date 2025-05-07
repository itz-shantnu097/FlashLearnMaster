import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/lib/types";

interface FlashcardViewProps {
  flashcards: Flashcard[];
  currentIndex: number;
  topic: string;
  onNext: () => void;
  onSaveForLater: () => void;
}

export default function FlashcardView({ 
  flashcards, 
  currentIndex, 
  topic, 
  onNext,
  onSaveForLater
}: FlashcardViewProps) {
  const currentCard = flashcards[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6 flex flex-col items-center">
        <div className="text-neutral-600 mb-2">
          <span className="font-medium">{currentIndex + 1}</span> of{" "}
          <span>{flashcards.length}</span> flashcards
        </div>
        
        <div className="flex items-center space-x-2">
          {flashcards.map((_, index) => (
            <div 
              key={index}
              className={`progress-dot h-2.5 w-2.5 rounded-full ${
                index <= currentIndex ? "bg-primary" : "bg-neutral-300"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Topic Header */}
      <div className="text-center mb-6">
        <h2 className="font-heading font-bold text-2xl text-primary">{topic}</h2>
      </div>
      
      {/* Flashcard */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flashcard-container w-full bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8 mb-6"
      >
        <div className="flashcard-content">
          <div className="text-center">
            <h3 className="font-heading font-bold text-xl mb-4 text-neutral-800">
              {currentCard.title}
            </h3>
            <div 
              className="prose max-w-none text-neutral-700"
              dangerouslySetInnerHTML={{ __html: currentCard.content }}
            />
          </div>
        </div>
      </motion.div>
      
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={onSaveForLater}
          variant="outline"
          className="px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Save for Later
        </Button>
        <Button 
          onClick={onNext}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
