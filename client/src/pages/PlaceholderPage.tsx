import { Button } from "@/components/ui/button";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Crestora Bank
          </a>
          <div className="flex items-center gap-4">
            <a href="/login">
              <Button variant="outline">Sign In</Button>
            </a>
            <a href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-xl text-slate-600 mb-8">
            This page is currently under construction. We are working hard to bring you the best experience.
          </p>
          <a href="/">
            <Button variant="outline" className="px-8">Return Home</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
