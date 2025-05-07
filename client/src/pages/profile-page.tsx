import { useAuth } from "@/hooks/use-auth";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { LearningSession } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, LogOut, BookOpen, Clock, AlertCircle, CheckCircle, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: sessions, isLoading } = useQuery<LearningSession[], Error>({
    queryKey: ["/api/user/history"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      }
    });
  };

  const handleRetakeTopic = async (sessionId: string) => {
    try {
      const response = await apiRequest("GET", `/api/sessions/${sessionId}`);
      const data = await response.json();
      
      // Navigate to flashcard view with the session data
      navigate(`/learn/${sessionId}`);
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  if (!user) {
    return null; // This should be handled by the protected route
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Learning Dashboard</h1>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home size={16} />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - User info */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <User size={24} />
                </div>
                <div>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Username</h3>
                  <p className="text-lg">{user.username}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Account Actions</h3>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your learning statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{sessions?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Topics Studied</div>
                </div>
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {sessions?.filter(s => s.completedAt !== null).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="bg-muted p-3 rounded-lg text-center col-span-2">
                  <div className="text-2xl font-bold">
                    {sessions?.reduce((sum, session) => sum + (session.score || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - Learning history */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <BookOpen size={24} />
                </div>
                <div>
                  <CardTitle>Learning History</CardTitle>
                  <CardDescription>
                    Review and retake your previous learning sessions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Topics</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {renderSessions(sessions, isLoading, handleRetakeTopic)}
                </TabsContent>
                
                <TabsContent value="completed">
                  {renderSessions(
                    sessions?.filter(s => s.completedAt !== null),
                    isLoading,
                    handleRetakeTopic
                  )}
                </TabsContent>
                
                <TabsContent value="in-progress">
                  {renderSessions(
                    sessions?.filter(s => s.completedAt === null),
                    isLoading,
                    handleRetakeTopic,
                    true
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function renderSessions(
  sessions: LearningSession[] | undefined,
  isLoading: boolean,
  handleRetakeTopic: (sessionId: string) => void,
  isInProgress: boolean = false
) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!sessions?.length) {
    return (
      <div className="text-center py-10 bg-muted/20 rounded-lg">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No learning sessions found</h3>
        <p className="text-muted-foreground mb-4">You haven't studied any topics yet.</p>
        <Button asChild>
          <Link href="/">Start Learning</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map(session => (
        <div key={session.id} className="border rounded-lg p-4 hover:bg-accent/10 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{session.topic}</h3>
                {session.completedAt ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle size={12} />
                    <span>Completed</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 border-amber-300 text-amber-800">
                    <Clock size={12} />
                    <span>In Progress</span>
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>
                    {session.createdAt ? format(new Date(session.createdAt), 'MMM d, yyyy') : 'Unknown date'}
                  </span>
                </div>
                
                {session.score !== null && (
                  <div className="flex items-center gap-1">
                    <CheckCircle size={14} />
                    <span>Score: {session.score}%</span>
                  </div>
                )}
                
                {/* Only completed sessions won't have this indicator */}
                {session.completedAt === null && (
                  <div className="flex items-center gap-1 mt-1 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200">
                    {session.progressType ? (
                      session.progressType === "flashcards" 
                        ? <BookOpen size={14} className="text-amber-700" />
                        : <CheckCircle size={14} className="text-amber-700" />
                    ) : (
                      <Clock size={14} className="text-amber-700" />
                    )}
                    <span className="font-medium text-amber-700">
                      {session.progressType 
                        ? (
                            session.progressType === "flashcards" 
                              ? "Pending: Flashcard Learning" 
                              : "Pending: Quiz Completion"
                          )
                        : "Pending: Not Started"
                      }
                      {session.progressType && session.progressIndex !== undefined && session.progressIndex !== null ? 
                        ` (${session.progressIndex + 1} of ${session.progressType === "flashcards" ? "10" : "5"})` : 
                        ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => handleRetakeTopic(session.id)}
              variant={session.progressType ? "default" : "outline"}
              className={session.progressType ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {session.completedAt ? 'Retake' : (session.progressType ? 'Continue' : 'Start')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}