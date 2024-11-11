import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Zap, Eye, Repeat, Workflow, Settings, ArrowRight, Github, BookOpen } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';

function AnimatedHeroText() {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex items-center gap-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className={`transition-all duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
          Comp
        </div>
        <div className={`transition-all duration-1000 delay-500 ${showAnimation ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          ext
        </div>
        <div className={`transition-all duration-1000 delay-1000 ${showAnimation ? 'opacity-100' : 'opacity-0 translate-x-4'}`}>
          AI
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-sm text-gray-500 transition-all duration-500 delay-1500 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          Compact
        </span>
        <span className={`text-sm text-gray-400 transition-all duration-500 delay-1500 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          +
        </span>
        <span className={`text-sm text-gray-500 transition-all duration-500 delay-1500 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          Context
        </span>
        <span className={`text-sm text-gray-400 transition-all duration-500 delay-1500 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          =
        </span>
        <span className={`text-sm font-medium text-blue-600 transition-all duration-500 delay-1500 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          CompextAI
        </span>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Boxes className="text-white" size={20} />
              </div>
              <span className="font-semibold text-xl">CompextAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Tooltip text="Docs">
                <a
                  href="https://compextai.notion.site/Docs-13b5ef52981080b4bdd9dcad34bbc394"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <BookOpen size={18} className="text-white" />
                </a>
              </Tooltip>
              <Tooltip text="Source Code">
                <a
                  href="https://github.com/burnerlee/compextAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Github size={18} className="text-white" />
                </a>
              </Tooltip>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <AnimatedHeroText />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Manage your AI conversations to generate shorter and cleaner prompts
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Complete observability over AI pipelines. Iterate faster and deploy changes without code updates.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Start for free <ArrowRight size={20} />
              </Link>
              <a
                href="#features"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for AI Operations
            </h2>
            <p className="text-lg text-gray-600">
              Built for developers and AI teams who need complete control and visibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Observability</h3>
              <p className="text-gray-600">
                Monitor every interaction, track performance, and gain insights into your AI's behavior in real-time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapid Iteration</h3>
              <p className="text-gray-600">
                Update AI behaviors on the fly without code deployments. Test and validate changes instantly.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Workflow className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Conversation Management</h3>
              <p className="text-gray-600">
                Organize and track AI conversations efficiently. Maintain context and improve outcomes.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Configuration</h3>
              <p className="text-gray-600">
                Customize prompts, manage templates, and fine-tune parameters with ease.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Repeat className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Version Control</h3>
              <p className="text-gray-600">
                Track changes, maintain multiple versions, and rollback when needed.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Boxes className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compact Context</h3>
              <p className="text-gray-600">
                Optimize context management for better performance and reduced costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your AI operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join companies using CompextAI to build better AI experiences.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Get started now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Boxes className="text-white" size={20} />
              </div>
              <span className="font-semibold">CompextAI</span>
            </div>
            <p className="text-gray-500">© 2024 CompextAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}