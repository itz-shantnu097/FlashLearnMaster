import { useDigestByWeek } from '@/hooks/use-digests';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Sparkles, Award, Clock, BarChart3, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/Header';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass?: string;
}

function InsightCard({ icon, title, description, colorClass = 'bg-blue-100 text-blue-700' }: InsightCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`pb-2 ${colorClass}`}>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <CardDescription className="text-sm text-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function DigestSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default function DigestDetailPage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const weekStart = location.split('/digest/')[1] || '';
  const { data: digest, isLoading, error } = useDigestByWeek(weekStart);
  
  // Helper to get the appropriate color for a score
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Helper to get insight card color based on type
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'activity':
      case 'streak':
        return 'bg-blue-100 text-blue-700';
      case 'performance':
      case 'improvement':
        return 'bg-amber-100 text-amber-700';
      case 'achievement':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-red-100 text-red-700';
      case 'recommendation':
        return 'bg-purple-100 text-purple-700';
      case 'timeSpent':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper to get the appropriate icon for an insight
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return <BookOpen className="h-5 w-5" />;
      case 'performance':
        return <BarChart3 className="h-5 w-5" />;
      case 'streak':
        return <Award className="h-5 w-5" />;
      case 'timeSpent':
        return <Clock className="h-5 w-5" />;
      case 'improvement':
        return <Target className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Header />
        <Alert className="mt-8">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please <Link href="/auth" className="font-medium underline">log in</Link> to view your learning digests.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formattedWeekStart = weekStart ? 
    format(new Date(weekStart), 'MMMM d, yyyy') : 
    'Loading...';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Header />
      
      <div className="space-y-6 mt-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/digest">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Learning Digest: Week of {formattedWeekStart}</h1>
        </div>

        {isLoading ? (
          <DigestSkeleton />
        ) : error || !digest ? (
          <Alert>
            <AlertTitle>Digest Not Found</AlertTitle>
            <AlertDescription>
              The learning digest for this week could not be found. 
              <Link href="/digest" className="ml-1 font-medium underline">
                Return to all digests
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>
                    {digest.weekStartDate 
                      ? `${format(new Date(digest.weekStartDate), 'MMM d')} - ${format(new Date(digest.weekEndDate), 'MMM d, yyyy')}`
                      : 'Week Details'}
                  </CardTitle>
                </div>
                <CardDescription>
                  Your personalized learning digest and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-muted-foreground text-sm">Sessions Completed</span>
                    <span className="text-3xl font-bold">{digest.completedSessions || 0}</span>
                    <span className="text-xs text-muted-foreground">of {digest.totalSessions || 0} started</span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-muted-foreground text-sm">Average Score</span>
                    <span className={`text-3xl font-bold ${getScoreColor(digest.averageScore)}`}>
                      {digest.averageScore ? `${digest.averageScore}%` : 'N/A'}
                    </span>
                    {digest.topPerformingTopic && (
                      <span className="text-xs text-muted-foreground text-center">
                        Best topic: {digest.topPerformingTopic}
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-muted-foreground text-sm">Learning Time</span>
                    <span className="text-3xl font-bold">{digest.totalTimeSpentMinutes || 0}</span>
                    <span className="text-xs text-muted-foreground">minutes</span>
                  </div>
                </div>
                
                {/* Points & Streak */}
                {((digest.pointsEarned && digest.pointsEarned > 0) || (digest.streak && digest.streak > 0)) && (
                  <div className="flex gap-4 mb-6">
                    {digest.pointsEarned && digest.pointsEarned > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center gap-3 flex-1">
                        <Award className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">+{digest.pointsEarned} points earned</div>
                          <div className="text-xs text-muted-foreground">Keep learning to earn more!</div>
                        </div>
                      </div>
                    )}
                    
                    {digest.streak && digest.streak > 0 && (
                      <div className="bg-amber-50 p-3 rounded-lg flex items-center gap-3 flex-1">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                        <div>
                          <div className="font-medium">{digest.streak} day streak</div>
                          <div className="text-xs text-muted-foreground">Keep it going!</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {digest.topCategory && (
                  <div className="p-4 border rounded-lg mb-6">
                    <div className="font-medium mb-1">Top Category: {digest.topCategory}</div>
                    <div className="text-sm text-muted-foreground">
                      You spent most of your time studying topics in this category. 
                      Keep exploring to deepen your knowledge!
                    </div>
                  </div>
                )}
                
                {/* Custom Insights */}
                {digest.insights && digest.insights.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {digest.insights.map((insight: any, index: number) => (
                        <InsightCard 
                          key={index}
                          icon={getInsightIcon(insight.type)}
                          title={insight.title}
                          description={insight.description}
                          colorClass={getInsightColor(insight.type)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Improvement Areas */}
                {digest.improvementAreas && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Areas for Improvement</h3>
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertTitle>Focus areas</AlertTitle>
                      <AlertDescription>
                        {digest.improvementAreas}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {/* Recommendations */}
                {digest.recommendations && digest.recommendations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Recommended Next Steps</h3>
                    <ul className="space-y-2">
                      {digest.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-1 rounded-full bg-green-100 p-1">
                            <Target className="h-3 w-3 text-green-700" />
                          </div>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/digest">Back to All Digests</Link>
              </Button>
              <Button asChild>
                <Link href="/">Continue Learning</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}