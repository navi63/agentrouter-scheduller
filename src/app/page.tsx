import Link from "next/link";
import { ArrowRight, Zap, Clock, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-8">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Stitch <span className="text-indigo-500">Auto-Credit</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Automate and schedule login/logout for agent routers to collect credits efficiently and securely.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg border border-slate-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-colors">
            <div className="bg-indigo-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Automation</h3>
            <p className="text-slate-400">
              Automate your router login and logout processes to collect credits automatically.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Scheduling</h3>
            <p className="text-slate-400">
              Schedule your credit collection tasks with flexible timing options.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
            <p className="text-slate-400">
              Your cookies and credentials are stored securely with encryption.
            </p>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-16 bg-gradient-to-br from-indigo-900/20 to-slate-800/20 border border-slate-700 rounded-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-slate-400 mb-6">
              Access the dashboard to manage your cookies, schedules, and track your credit collection progress.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
