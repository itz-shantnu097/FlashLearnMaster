import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopicInput from "@/components/TopicInput";
import LoadingView from "@/components/LoadingView";
import FlashcardView from "@/components/FlashcardView";
import MCQView from "@/components/MCQView";
import ResultsView from "@/components/ResultsView";
import SampleDataNotice from "@/components/SampleDataNotice";
import { apiRequest } from "@/lib/queryClient";
import { Flashcard, MCQQuestion, LearningResult } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

type ViewState = "topicInput" | "loading" | "flashcard" | "mcq" | "results";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("topicInput");
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [resultsData, setResultsData] = useState<LearningResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/:path*");
  
  // Parse URL parameters for topic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topicParam = urlParams.get('topic');
    
    if (topicParam) {
      setTopic(decodeURIComponent(topicParam));
      
      // If user is authenticated, start learning immediately
      if (user && !isAuthLoading) {
        handleTopicSubmit(decodeURIComponent(topicParam));
      } else if (!isAuthLoading) {
        // If not authenticated, redirect to auth page
        navigate('/auth');
      }
    }
  }, [user, isAuthLoading]);

  const handleTopicSubmit = async (inputTopic: string) => {
    // Check if user is authenticated
    if (!user && !isAuthLoading) {
      // If not logged in, redirect to auth page with topic as parameter to return later
      navigate(`/auth?redirect=/?topic=${encodeURIComponent(inputTopic)}`);
      return;
    }
    
    setTopic(inputTopic);
    setViewState("loading");
    
    try {
      const response = await apiRequest("POST", "/api/learning/generate", { topic: inputTopic });
      const data = await response.json();
      
      setFlashcards(data.flashcards);
      setMcqs(data.mcqs);
      setUsingSampleData(!!data.usingSampleData); // Set the flag based on API response
      setSessionId(data.sessionId || null); // Store the session ID
      setCurrentFlashcardIndex(0);
      setViewState("flashcard");
    } catch (error) {
      console.error("Failed to generate learning materials:", error);
      setViewState("topicInput");
    }
  };

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

    if (currentMcqIndex < mcqs.length - 1) {
      setCurrentMcqIndex(currentMcqIndex + 1);
    } else {
      // Calculate results
      setViewState("loading");
      
      try {
        const response = await apiRequest("POST", "/api/learning/results", {
          topic,
          mcqs,
          selectedAnswers: newSelectedAnswers,
          sessionId,  // Pass the session ID
          usingSampleData  // Pass the flag to the API
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
    setTopic("");
    setFlashcards([]);
    setMcqs([]);
    setSelectedAnswers([]);
    setResultsData(null);
    setSessionId(null); // Reset session ID
    setViewState("topicInput");
  };

  const handleRetryTopic = async () => {
    setViewState("loading");
    
    try {
      const response = await apiRequest("POST", "/api/learning/generate", { topic });
      const data = await response.json();
      
      setFlashcards(data.flashcards);
      setMcqs(data.mcqs);
      setUsingSampleData(!!data.usingSampleData); // Update sample data flag
      setSessionId(data.sessionId || null); // Store the session ID
      setCurrentFlashcardIndex(0);
      setSelectedAnswers([]);
      setViewState("flashcard");
    } catch (error) {
      console.error("Failed to regenerate learning materials:", error);
      setViewState("topicInput");
    }
  };

  const updateTimer = (newTime: number) => {
    setTimeRemaining(newTime);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 sm:px-6">
        {/* Sample data notice - show on all screens except loading and topic input */}
        {viewState !== "loading" && viewState !== "topicInput" && (
          <SampleDataNotice isVisible={usingSampleData} />
        )}
        
        {viewState === "topicInput" && (
          <TopicInput onSubmit={handleTopicSubmit} initialTopic={topic} />
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
          />
        )}
        
        {viewState === "mcq" && mcqs.length > 0 && (
          <MCQView
            questions={mcqs}
            currentIndex={currentMcqIndex}
            onSubmit={handleSubmitAnswer}
            initialTime={timeRemaining}
            onTimeUpdate={updateTimer}
            onTimeEnd={() => {
              if (selectedAnswers.length > 0) {
                handleSubmitAnswer(selectedAnswers[selectedAnswers.length - 1]);
              }
            }}
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
