import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function LoadingView() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white rounded-xl shadow-md overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-primary-light h-20 w-20 flex items-center justify-center mb-4">
              <Loader className="text-primary text-3xl animate-spin" />
            </div>
            <h2 className="font-heading font-bold text-xl text-neutral-800 mb-2">
              Creating your learning materials...
            </h2>
            <p className="text-neutral-600 max-w-md">
              We're generating flashcards and questions based on your topic. This should take just a moment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
