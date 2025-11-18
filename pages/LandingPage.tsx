
import React from 'react';
import { ChartAnalyticsIcon, LayoutIcon, SparklesIcon } from '../components/Icons';
import Logo from '../components/Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Placeholder logos for the "Trusted By" section
const CompanyLogo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex-shrink-0 w-32 h-16 flex items-center justify-center text-slate-400" aria-hidden="true">
        {children}
    </div>
);

// Fortune 500 Company Logos (Simplified SVG representations)
const OracleLogo = () => (
  <svg viewBox="0 0 120 30" fill="currentColor" height="25" width="100">
    <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="22" letterSpacing="1">ORACLE</text>
  </svg>
);

const CiscoLogo = () => (
  <svg viewBox="0 0 100 40" fill="currentColor" height="35" width="90">
    <path d="M10 25v-8h3v8h-3zm6 0v-14h3v14h-3zm6 0v-20h3v20h-3zm6 0v-14h3v14h-3zm6 0v-8h3v8h-3z" />
    <text x="42" y="25" fontFamily="sans-serif" fontWeight="bold" fontSize="18">CISCO</text>
  </svg>
);

const IntelLogo = () => (
    <svg viewBox="0 0 100 40" fill="currentColor" height="35" width="90">
        <path d="M5 12 Q 50 -5 95 12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <text x="18" y="26" fontFamily="sans-serif" fontWeight="bold" fontSize="22" letterSpacing="-1">intel</text>
        <path d="M5 28 Q 50 45 95 28" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    </svg>
);

const PfizerLogo = () => (
   <svg viewBox="0 0 100 40" fill="currentColor" height="30" width="90">
        <text x="5" y="28" fontFamily="serif" fontWeight="bold" fontSize="28" fontStyle="italic">Pfizer</text>
   </svg>
);

const FedExLogo = () => (
   <svg viewBox="0 0 100 40" fill="currentColor" height="30" width="90">
        <text x="0" y="28" fontFamily="sans-serif" fontWeight="900" fontSize="26" letterSpacing="-1">Fed</text>
        <text x="46" y="28" fontFamily="sans-serif" fontWeight="900" fontSize="26" letterSpacing="-1">Ex</text>
   </svg>
);

const ThreeMLogo = () => (
    <svg viewBox="0 0 60 40" fill="currentColor" height="35" width="60">
        <text x="0" y="30" fontFamily="sans-serif" fontWeight="900" fontSize="36" letterSpacing="-2">3M</text>
    </svg>
);

const HoneywellLogo = () => (
    <svg viewBox="0 0 140 40" fill="currentColor" height="30" width="120">
       <text x="0" y="26" fontFamily="sans-serif" fontWeight="800" fontSize="22">Honeywell</text>
    </svg>
);

const AdobeLogo = () => (
    <svg viewBox="0 0 120 40" fill="currentColor" height="35" width="100">
        <path d="M0 30 L10 5 L20 30 H15 L12 22 H8 L5 30 Z" />
        <text x="28" y="26" fontFamily="sans-serif" fontWeight="bold" fontSize="22">Adobe</text>
    </svg>
);

const logos = [
    <OracleLogo />, <CiscoLogo />, <IntelLogo />, <PfizerLogo />,
    <FedExLogo />, <ThreeMLogo />, <HoneywellLogo />, <AdobeLogo />
];


const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen antialiased font-['Roboto']">
      <div className="relative isolate overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div 
            className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80d4ff] to-[#4f46e5] opacity-20 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 p-4 transition-shadow duration-300 bg-slate-50/80 backdrop-blur-sm">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Logo className="w-8 h-8 text-indigo-500" />
                    <span className="text-xl font-bold font-['Montserrat']">
                        <span style={{ color: 'var(--logo-color-sheet)' }}>Sheet</span>
                        <span style={{ color: 'var(--logo-color-sight)' }}>Sight</span>
                    </span>
                </div>
                <nav>
                    <button
                        onClick={onGetStarted}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        Get Started Free
                    </button>
                </nav>
            </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-['Montserrat'] font-extrabold text-slate-900 !leading-tight tracking-tighter">
            Transform Spreadsheets into <br />
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Stunning Dashboards</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600">
            Unlock the power of your data. No code, no complexity. Just upload an Excel/CSV file or paste your data, and let SheetSight build a beautiful, shareable dashboard for you instantly.
          </p>
          <div className="mt-10">
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg shadow-indigo-500/20"
            >
              Create Your Dashboard &rarr;
            </button>
          </div>
        </main>

        {/* "Trusted By" Scroller */}
        <div className="py-12">
            <div className="container mx-auto text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Trusted by teams at Fortune 500 companies</p>
                <div className="mt-8 w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_48px,_black_calc(100%-48px),transparent_100%)]">
                    <div className="flex items-center justify-center md:justify-start w-max animate-scroll">
                        {logos.map((logo, i) => <CompanyLogo key={i}>{logo}</CompanyLogo>)}
                        {logos.map((logo, i) => <CompanyLogo key={`dup-${i}`}>{logo}</CompanyLogo>)}
                    </div>
                </div>
            </div>
        </div>

        {/* Visual Demo */}
        <section className="px-4" aria-labelledby="demo-title">
            <h2 id="demo-title" className="sr-only">Demonstration of SheetSight transforming a spreadsheet into a dashboard.</h2>
            <div className="relative max-w-6xl mx-auto mt-10 p-2 bg-white/60 rounded-xl shadow-2xl ring-1 ring-slate-900/10">
                <div className="p-2 bg-slate-100 rounded-t-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="aspect-video bg-slate-200 rounded-b-lg flex items-center justify-center overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/janjez/ExcelDash/S2D.png?updatedAt=1763460834829"
                        alt="A diagram showing a spreadsheet on the left being transformed into a sleek, colorful dashboard with charts and graphs on the right by the SheetSight application."
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-24" aria-labelledby="features-title">
            <div className="text-center mb-16">
                <h2 id="features-title" className="text-4xl font-['Montserrat'] font-bold text-slate-900">Why SheetSight?</h2>
                <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Everything you need for rapid data analysis and presentation, without the learning curve.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-lg text-center border border-slate-200 shadow-sm">
                    <div className="inline-block p-4 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                        <SparklesIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-['Montserrat'] font-semibold text-slate-900">Instant Visualization</h3>
                    <p className="mt-2 text-slate-600">
                        From raw data to beautiful charts in a flash. Upload or paste your data and watch it come to life without any manual setup.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-lg text-center border border-slate-200 shadow-sm">
                    <div className="inline-block p-4 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                        <LayoutIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-['Montserrat'] font-semibold text-slate-900">Interactive & Customizable</h3>
                    <p className="mt-2 text-slate-600">
                        Don't just view your data, interact with it. Drag, drop, and resize widgets. Create custom charts, tables, and KPI cards to tell your story.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-lg text-center border border-slate-200 shadow-sm">
                    <div className="inline-block p-4 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                        <ChartAnalyticsIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-['Montserrat'] font-semibold text-slate-900">Powerful Analytics</h3>
                    <p className="mt-2 text-slate-600">
                        Go beyond the surface. Filter, sort, and perform calculations on the fly. Discover insights you've been missing with our intuitive tools.
                    </p>
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white py-20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-['Montserrat'] font-bold text-slate-900">Ready to See Your Data in a New Light?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                    Stop wrestling with pivot tables and complex BI tools. Start building dashboards that make an impact today.
                </p>
                <div className="mt-8">
                    <button
                        onClick={onGetStarted}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg shadow-indigo-500/20"
                    >
                        Get Started - It's Free
                    </button>
                </div>
            </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 bg-slate-100 border-t border-slate-200">
            <div className="container mx-auto text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} SheetSight. All rights reserved.</p>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
