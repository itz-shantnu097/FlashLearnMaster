import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, Check, Clock, Trophy, ChevronRight, Sparkles } from "lucide-react";

export default function NewHome() {
  const [topic, setTopic] = useState("");
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  const handleStartLearning = () => {
    if (!topic.trim()) {
      return; // Don't proceed if topic is empty
    }
    
    if (!user && !isLoading) {
      // If not logged in, redirect to auth page
      navigate("/auth");
    } else {
      // If logged in, navigate to the learning page with the topic
      navigate(`/?topic=${encodeURIComponent(topic)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background pt-16 pb-24">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center mb-6">
              <Brain className="text-primary text-5xl mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                LearnSmart
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              AI-powered learning platform that creates personalized flashcards and quizzes on any topic you want to learn
            </p>
            
            <div className="max-w-lg mx-auto mb-8">
              <div className="flex flex-col space-y-3">
                <Label htmlFor="topic" className="text-left text-lg">What would you like to learn today?</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="topic" 
                    placeholder="Enter a topic (e.g., Python Programming, World History)" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStartLearning();
                      }
                    }}
                  />
                  <Button onClick={handleStartLearning}>
                    Start Learning
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Learn on Any Topic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI generates custom educational content based on what you want to learn
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Explore Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Review AI-generated flashcards that present key concepts and information about your chosen topic in an easy-to-understand format.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Take Timed Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Test your knowledge with multiple-choice questions to reinforce your learning and identify areas for improvement.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Track Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get personalized feedback on your performance and track your learning journey over time with detailed analytics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose LearnSmart?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">AI-Powered Content</h3>
                  <p className="text-muted-foreground">
                    Our advanced AI creates high-quality educational content customized to your learning needs.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Learn at Your Pace</h3>
                  <p className="text-muted-foreground">
                    Study any topic at your own speed, with materials that adapt to your knowledge level.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Personalized Feedback</h3>
                  <p className="text-muted-foreground">
                    Receive tailored recommendations to improve your understanding and focus your study efforts.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Save Your Progress</h3>
                  <p className="text-muted-foreground">
                    Create an account to save your learning sessions and track your improvement over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary/20 to-primary/5">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Boost Your Knowledge?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Start learning any topic with our AI-powered platform. Enter a topic above or create an account to track your progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Start Learning Now <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              {!user && (
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                  Create Account
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}