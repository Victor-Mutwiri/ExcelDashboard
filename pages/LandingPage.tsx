
import React from 'react';
import { ChartAnalyticsIcon, LayoutIcon, SparklesIcon, TableIcon } from '../components/Icons';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen antialiased">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-gray-700/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>

      <div className="relative isolate overflow-hidden">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <TableIcon className="w-8 h-8 text-indigo-400" />
                    <span className="text-2xl font-bold text-white">DataDash</span>
                </div>
                <button
                    onClick={onGetStarted}
                    className="bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Get Started
                </button>
            </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Transform Spreadsheets into <span className="text-indigo-400">Stunning Dashboards</span> in Seconds
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-300">
            Unlock the power of your data. No code, no complexity. Just upload your Excel or CSV file, or paste your data, and let DataDash build a beautiful, shareable dashboard for you instantly.
          </p>
          <div className="mt-10">
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
            >
              Create Your Dashboard for Free
            </button>
          </div>
        </main>

        {/* Visual Demo */}
        <section className="px-4">
            <div className="relative max-w-5xl mx-auto mt-10 p-2 bg-gray-700/20 rounded-xl shadow-2xl ring-1 ring-white/10">
                <div className="aspect-video bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                    <p className="text-gray-500">
                        {/* A more descriptive visual placeholder can be added here */}
                        [Image: A spreadsheet on the left transforming into a sleek dashboard on the right]
                    </p>
                </div>
                 <div className="absolute inset-0 -z-10 bg-indigo-500/10 blur-3xl" aria-hidden="true"></div>
            </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white">Why DataDash is the best choice</h2>
                <p className="mt-4 text-gray-400">Everything you need for rapid data analysis and presentation.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-800/50 p-8 rounded-lg text-center">
                    <div className="inline-block p-4 bg-indigo-600/20 text-indigo-400 rounded-lg mb-4">
                        <SparklesIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Instant Visualization</h3>
                    <p className="mt-2 text-gray-400">
                        From raw data to beautiful charts in a flash. Upload or paste your data and watch it come to life without any manual setup.
                    </p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-lg text-center">
                    <div className="inline-block p-4 bg-indigo-600/20 text-indigo-400 rounded-lg mb-4">
                        <LayoutIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Interactive & Customizable</h3>
                    <p className="mt-2 text-gray-400">
                        Don't just view your data, interact with it. Drag, drop, and resize widgets. Create custom charts, tables, and KPI cards to tell your story.
                    </p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-lg text-center">
                    <div className="inline-block p-4 bg-indigo-600/20 text-indigo-400 rounded-lg mb-4">
                        <ChartAnalyticsIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Powerful Analytics</h3>
                    <p className="mt-2 text-gray-400">
                        Go beyond the surface. Filter, sort, and perform calculations on the fly. Discover insights you've been missing with our intuitive tools.
                    </p>
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gray-800/50 py-20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-white">Ready to See Your Data in a New Light?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-gray-300">
                    Stop wrestling with pivot tables and complex BI tools. Start building dashboards that make an impact today.
                </p>
                <div className="mt-8">
                    <button
                        onClick={onGetStarted}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
                    >
                        Get Started - It's Free
                    </button>
                </div>
            </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8">
            <div className="container mx-auto text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} DataDash. All rights reserved.</p>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
