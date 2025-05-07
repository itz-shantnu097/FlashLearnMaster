import { Brain } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Brain className="text-primary text-3xl" />
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-neutral-800">LearnSmart</h1>
        </div>
      </div>
    </header>
  );
}
