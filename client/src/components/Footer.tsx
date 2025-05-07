export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} LearnSmart. Inspired by Khan Academy. Created for educational purposes.</p>
        </div>
      </div>
    </footer>
  );
}
