import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { BookOpen } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" });
  const { toast } = useToast();

  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate(loginForm);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate({
      username: registerForm.username,
      password: registerForm.password,
    });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md">
          <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your learning history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Enter your username"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Sign up to track your learning progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input 
                        id="reg-username" 
                        type="text"
                        placeholder="Choose a username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input 
                        id="reg-password" 
                        type="password"
                        placeholder="Choose a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                      <Input 
                        id="reg-confirm-password" 
                        type="password"
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side - Hero */}
      <div className="hidden md:flex w-1/2 bg-primary text-primary-foreground flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <BookOpen size={64} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">AI-Powered Learning Platform</h1>
          <p className="text-lg mb-8">
            Create personalized flashcards and quizzes on any topic, track your progress, and improve your knowledge.
          </p>
          <div className="space-y-4">
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <h3 className="font-medium text-xl mb-2">Track Your Learning Journey</h3>
              <p>Save your learning sessions and revisit topics you've studied before.</p>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <h3 className="font-medium text-xl mb-2">Personalized Feedback</h3>
              <p>Get AI-generated feedback on your quiz performance to focus your studies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}