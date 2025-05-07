import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Flashcard, MCQQuestion, LearningResult } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingView from "@/components/LoadingView";
import FlashcardView from "@/components/FlashcardView";
import MCQView from "@/components/MCQView";
import ResultsView from "@/components/ResultsView";
import SampleDataNotice from "@/components/SampleDataNotice";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ViewState = "loading" | "flashcard" | "mcq" | "results";

interface SessionData {
  session: {
    id: string;
    topic: string;
    score: number | null;
    completedAt: string | null;
    createdAt: string;
    userId: number | null;
  };
  flashcards: Flashcard[];
  mcqs: MCQQuestion[];
}

export default function LearnSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const sessionId = params.sessionId;
  
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [resultsData, setResultsData] = useState<LearningResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Fetch session data
  const { data: sessionData, isLoading, error } = useQuery<SessionData, Error>({
    queryKey: [`/api/sessions/${sessionId}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  useEffect(() => {
    if (sessionData && !isLoading) {
      setViewState("flashcard");
    }
  }, [sessionData, isLoading]);

  if (isLoading) {
    return <LoadingView />;
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 sm:px-6">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
            <p className="mb-6">
              We couldn't find the learning session you requested. It may have been deleted or you may not have permission to access it.
            </p>
            <Button asChild>
              <a href="/profile">Back to Profile</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { session, flashcards, mcqs } = sessionData;
  const topic = session.topic;

  // Process MCQs to convert options from string to array
  const processedMcqs: MCQQuestion[] = mcqs.map(mcq => ({
    ...mcq,
    options: typeof mcq.options === 'string' ? JSON.parse(mcq.options as string) : mcq.options
  }));

  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else {
      // Start MCQ test
      setCurrentMcqIndex(0);
      setSelectedAnswers([]);
      setTimeRemaining(300); // 5 minutes (300 seconds)
      setViewState("mcq");
    }
  };

  const handleSubmitAnswer = async (answerIndex: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentMcqIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);

    if (currentMcqIndex < processedMcqs.length - 1) {
      setCurrentMcqIndex(currentMcqIndex + 1);
    } else {
      // Calculate results
      setViewState("loading");
      
      try {
        const response = await apiRequest("POST", "/api/learning/results", {
          topic,
          mcqs: processedMcqs,
          selectedAnswers: newSelectedAnswers,
          sessionId: session.id,
          usingSampleData
        });
        
        const results = await response.json();
        setResultsData(results);
        setViewState("results");
      } catch (error) {
        console.error("Failed to calculate results:", error);
      }
    }
  };

  const handleNewTopic = () => {
    navigate("/");
  };

  const handleRetryTopic = () => {
    setCurrentFlashcardIndex(0);
    setCurrentMcqIndex(0);
    setSelectedAnswers([]);
    setResultsData(null);
    setViewState("flashcard");
  };

  const updateTimer = (newTime: number) => {
    setTimeRemaining(newTime);
  };
  
  // Handler for saving flashcard progress for later
  const handleSaveFlashcardsForLater = async () => {
    try {
      // Save progress to the database
      await apiRequest("POST", "/api/learning/save-progress", {
        sessionId,
        type: "flashcards",
        currentIndex: currentFlashcardIndex,
        topic
      });
      
      // Redirect to profile/dashboard
      navigate("/profile");
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };
  
  // Handler for saving MCQ progress for later
  const handleSaveMCQForLater = async () => {
    try {
      // Save progress to the database
      await apiRequest("POST", "/api/learning/save-progress", {
        sessionId,
        type: "mcq",
        currentIndex: currentMcqIndex,
        answers: selectedAnswers,
        timeRemaining,
        topic
      });
      
      // Redirect to profile/dashboard
      navigate("/profile");
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="bg-muted py-2 px-4">
        <div className="container mx-auto">
          <Button
            variant="outline"
            size="sm"
            className="mb-0"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
      
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 sm:px-6">
        {/* Sample data notice - show on all screens except loading */}
        {viewState !== "loading" && (
          <SampleDataNotice isVisible={usingSampleData} />
        )}
        
        {viewState === "loading" && (
          <LoadingView />
        )}
        
        {viewState === "flashcard" && flashcards.length > 0 && (
          <FlashcardView
            flashcards={flashcards}
            currentIndex={currentFlashcardIndex}
            topic={topic}
            onNext={handleNextFlashcard}
            onSaveForLater={handleSaveFlashcardsForLater}
          />
        )}
        
        {viewState === "mcq" && processedMcqs.length > 0 && (
          <MCQView
            questions={processedMcqs}
            currentIndex={currentMcqIndex}
            onSubmit={handleSubmitAnswer}
            initialTime={timeRemaining}
            onTimeUpdate={updateTimer}
            onTimeEnd={() => {
              if (selectedAnswers.length > 0) {
                handleSubmitAnswer(selectedAnswers[selectedAnswers.length - 1]);
              }
            }}
            onSaveForLater={handleSaveMCQForLater}
          />
        )}
        
        {viewState === "results" && resultsData && (
          <ResultsView
            results={resultsData}
            topic={topic}
            onNewTopic={handleNewTopic}
            onRetryTopic={handleRetryTopic}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}