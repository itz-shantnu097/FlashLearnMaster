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
import { 
  User, LogOut, BookOpen, Clock, AlertCircle, CheckCircle, Home, 
  ChevronDown, ChevronUp, FolderClosed, FolderOpen 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ShareProgress from "@/components/ShareProgress";

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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Your Learning Dashboard</h1>
        <div className="flex">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Home size={16} />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Sidebar - User info */}
        <div className="w-full lg:w-1/3">
          <div className="space-y-4">
            <Card>
              <CardHeader className="sm:pb-4 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full">
                    <User size={20} className="sm:w-6 sm:h-6 w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Your Profile</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Manage your account</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium">Username</h3>
                    <p className="text-base sm:text-lg">{user.username}</p>
                  </div>
                  
                  <div className="pt-3 sm:pt-4 border-t">
                    <h3 className="text-xs sm:text-sm font-medium mb-2">Account Actions</h3>
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
            
            <Card>
              <CardHeader className="sm:pb-4 pb-2">
                <CardTitle className="text-base sm:text-lg">Statistics</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your learning statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold">{sessions?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Topics Studied</div>
                  </div>
                  <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold">
                      {sessions?.filter(s => s.completedAt !== null).length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="bg-muted p-2 sm:p-3 rounded-lg text-center col-span-2">
                    <div className="text-xl sm:text-2xl font-bold">
                      {sessions?.reduce((sum, session) => sum + (session.score || 0), 0) || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Main content - Learning history */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader className="sm:pb-4 pb-2">
              <div className="flex items-center space-x-2">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <BookOpen size={20} className="sm:w-6 sm:h-6 w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Learning History</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Review and retake your previous learning sessions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4 w-full flex">
                  <TabsTrigger value="all" className="flex-1">All Topics</TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
                  <TabsTrigger value="in-progress" className="flex-1">In Progress</TabsTrigger>
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

interface TopicGroup {
  topic: string;
  sessions: LearningSession[];
  hasInProgress: boolean;
  latestDate: Date;
}

function renderSessionsGrouped(
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
        <p className="text-muted-foreground mb-4">You haven't studied any topics yet. Go to the home page to start learning.</p>
      </div>
    );
  }

  // Group sessions by topic
  const topicGroups: Record<string, TopicGroup> = {};

  sessions.forEach(session => {
    const topic = session.topic.toLowerCase();
    if (!topicGroups[topic]) {
      topicGroups[topic] = {
        topic: session.topic,
        sessions: [],
        hasInProgress: false,
        latestDate: new Date(session.createdAt)
      };
    }

    // Update group info
    topicGroups[topic].sessions.push(session);
    if (session.completedAt === null) {
      topicGroups[topic].hasInProgress = true;
    }

    // Track the latest date for sorting
    const sessionDate = new Date(session.createdAt);
    if (sessionDate > topicGroups[topic].latestDate) {
      topicGroups[topic].latestDate = sessionDate;
    }
  });

  // Convert to array and sort by recent date and status
  const sortedGroups = Object.values(topicGroups)
    .sort((a, b) => {
      // Sort by in-progress first, then by date
      if (a.hasInProgress && !b.hasInProgress) return -1;
      if (!a.hasInProgress && b.hasInProgress) return 1;
      return b.latestDate.getTime() - a.latestDate.getTime();
    });

  return (
    <div className="space-y-4">
      {sortedGroups.map(group => (
        <TopicGroupComponent
          key={group.topic}
          group={group}
          handleRetakeTopic={handleRetakeTopic}
        />
      ))}
    </div>
  );
}

function TopicGroupComponent({ 
  group, 
  handleRetakeTopic 
}: { 
  group: TopicGroup; 
  handleRetakeTopic: (sessionId: string) => void;
}) {
  const [open, setOpen] = useState(group.hasInProgress);
  const sessionCount = group.sessions.length;
  
  // Sort sessions with most recent first and in-progress at the top
  const sortedSessions = [...group.sessions].sort((a, b) => {
    // In-progress first
    if (a.completedAt === null && b.completedAt !== null) return -1;
    if (a.completedAt !== null && b.completedAt === null) return 1;
    
    // Then by date (newest first)
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className="border rounded-lg transition-colors overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5 focus:outline-none">
          <div className="flex items-center gap-2">
            {open ? 
              <FolderOpen size={20} className="text-blue-600" /> : 
              <FolderClosed size={20} className="text-blue-600" />
            }
            <div>
              <h3 className="font-medium text-base sm:text-lg text-left">{group.topic}</h3>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>{sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}</span>
                {group.hasInProgress && (
                  <Badge variant="outline" className="text-xs py-0 h-5 bg-amber-100 border-amber-300 text-amber-800">
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div>
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t p-2 sm:p-3 space-y-2 bg-slate-50/50">
            {sortedSessions.map(session => (
              <SessionItem 
                key={session.id} 
                session={session} 
                handleRetakeTopic={handleRetakeTopic} 
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function SessionItem({ 
  session, 
  handleRetakeTopic 
}: { 
  session: LearningSession; 
  handleRetakeTopic: (sessionId: string) => void;
}) {
  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-white hover:bg-accent/5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-2">
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
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                <Clock size={14} />
                <span>
                  {session.createdAt ? format(new Date(session.createdAt), 'MMM d, yyyy') : 'Unknown date'}
                </span>
              </div>
            </div>
            <ShareProgress 
              variant="icon" 
              topic={session.topic}
              score={session.score} 
              completedAt={session.completedAt ? new Date(session.completedAt).toISOString() : null}
              className="text-gray-500 hover:text-gray-700"
            />
          </div>
          
          {session.score !== null && (
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-1">
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
              <span className="font-medium text-amber-700 text-xs sm:text-sm">
                {session.progressType 
                  ? (
                      session.progressType === "flashcards" 
                        ? "Pending: Flashcard Learning" 
                        : "Pending: Quiz Completion"
                    )
                  : "Pending: Continue Learning"
                }
                {session.progressType && session.progressIndex !== undefined && session.progressIndex !== null ? 
                  ` (${session.progressIndex + 1} of ${session.progressType === "flashcards" ? "10" : "5"})` : 
                  ""}
              </span>
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => handleRetakeTopic(session.id)}
          variant={session.progressType ? "default" : "outline"}
          className={`${session.progressType ? "bg-blue-600 hover:bg-blue-700" : ""} sm:self-start sm:mt-0 mt-2`}
          size="sm"
        >
          {session.completedAt ? 'Retake' : (session.progressType ? 'Continue' : 'Resume')}
        </Button>
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
  // Use our topic grouping functionality
  return renderSessionsGrouped(sessions, isLoading, handleRetakeTopic, isInProgress);
}