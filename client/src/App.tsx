import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import NewHome from "@/pages/new-home";
import ProfilePage from "@/pages/profile-page";
import AuthPage from "@/pages/auth-page";
import LearnSessionPage from "@/pages/learn-session-page";
import DigestPage from "@/pages/digest-page";
import DigestDetailPage from "@/pages/digest-detail-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NewHome} />
      <Route path="/learn" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/learn/:sessionId" component={LearnSessionPage} />
      <ProtectedRoute path="/digest" component={DigestPage} />
      <ProtectedRoute path="/digest/:weekStart" component={DigestDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
