import React from 'react';
import { Link } from 'react-router-dom';
import { ChartAnalyticsIcon, LayoutIcon, SparklesIcon, CheckCircleIcon } from '../components/Icons';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

interface SeoPageProps {
    type: 'generator' | 'excel-to-dashboard' | 'csv-tool' | 'faq' | 'features';
}

const SeoPage: React.FC<SeoPageProps> = ({ type }) => {
    
    const content = {
        generator: {
            title: "Free Excel Dashboard Generator",
            subtitle: "Turn your spreadsheets into professional, interactive dashboards in seconds. The #1 no-code dashboard tool.",
            keywords: ["excel dashboard generator", "automated data visualizations", "online dashboard creator"],
            heroText: "Stop building charts manually. Upload your Excel file and let our AI dashboard generator create the visualization for you.",
            metaTitle: "Excel Dashboard Generator | Turn Excel into Dashboard Free"
        },
        'excel-to-dashboard': {
            title: "Convert Excel to Dashboard Instantly",
            subtitle: "Seamlessly transform .xlsx files into shareable, insightful dashboards without writing a single formula.",
            keywords: ["excel to dashboard", "excel analytics tool", "business intelligence tool"],
            heroText: "Your data is trapped in cells. Unlock it with SheetSight. We convert static Excel sheets into dynamic business intelligence reports.",
            metaTitle: "Convert Excel to Dashboard | Excel Analytics Tool"
        },
        'csv-tool': {
            title: "CSV Dashboard Tool & Viewer",
            subtitle: "The fastest way to visualize CSV data. Upload, configure, and analyze your datasets online.",
            keywords: ["csv dashboard generator", "csv to dashboard", "data visualization features"],
            heroText: "Handle large CSV exports with ease. Our engine parses millions of data points and turns them into clear, actionable charts.",
            metaTitle: "CSV Dashboard Generator | Visualize CSV Files Online"
        },
        'faq': {
            title: "Dashboard Software FAQ",
            subtitle: "Common questions about using SheetSight to visualize your data.",
            keywords: ["dashboard software FAQ", "dashboard builder online"],
            heroText: "Everything you need to know about security, data formats, and features.",
            metaTitle: "Dashboard Tool FAQ | SheetSight"
        },
        'features': {
            title: "Data Visualization Features",
            subtitle: "Explore the powerful analytics capabilities of SheetSight.",
            keywords: ["data visualization features", "AI chart generator", "AI spreadsheet analysis"],
            heroText: "From pivot tables to AI-driven insights, discover why SheetSight is the ultimate BI tool for small business.",
            metaTitle: "SheetSight Features | AI Data Analysis Tool"
        }
    }[type];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 p-4 bg-white/90 backdrop-blur-sm border-b border-slate-200">
                <div className="container mx-auto flex justify-between items-center">
                     <Link to="/" className="flex items-center gap-2 group">
                        <Logo className="w-8 h-8 text-indigo-500 transition-transform group-hover:scale-110" />
                        <span className="text-xl font-bold font-['Montserrat']">
                            <span style={{ color: 'var(--logo-color-sheet)' }}>Sheet</span>
                            <span style={{ color: 'var(--logo-color-sight)' }}>Sight</span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                        <Link to="/features" className="hover:text-indigo-600">Features</Link>
                        <Link to="/dashboard-generator" className="hover:text-indigo-600">Excel Tool</Link>
                        <Link to="/csv-dashboard-tool" className="hover:text-indigo-600">CSV Tool</Link>
                    </nav>
                    <Link to="/app" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                        Launch App
                    </Link>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero */}
                <section className="py-20 px-6 text-center bg-gradient-to-b from-white to-slate-100">
                    <div className="container mx-auto max-w-4xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold font-['Montserrat'] tracking-tight mb-6">
                            {content.title}
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            {content.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/app" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30">
                                Start Building for Free
                            </Link>
                            <Link to="/features" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                View Features
                            </Link>
                        </div>
                        <div className="mt-6 text-sm text-slate-500 flex flex-wrap justify-center gap-2">
                            {content.keywords.map(k => (
                                <span key={k} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">#{k}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Content Body */}
                <section className="py-16 px-6">
                    <div className="container mx-auto max-w-5xl">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Why choose SheetSight?</h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    {content.heroText}
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "No-code dashboard tool suitable for everyone",
                                        "Turn spreadsheet into dashboard in minutes",
                                        "AI excel insights and automated reporting",
                                        "Secure, client-side processing"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                {/* Abstract representation of the tool */}
                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                                    <div className="absolute top-4 left-4 right-4 bottom-4 grid grid-cols-2 gap-4">
                                        <div className="bg-indigo-100 rounded h-20 w-full"></div>
                                        <div className="bg-blue-100 rounded h-20 w-full"></div>
                                        <div className="col-span-2 bg-slate-200 rounded h-32 w-full"></div>
                                    </div>
                                </div>
                                <p className="text-center text-sm text-slate-400 mt-4 italic">Visualizing complex data made simple</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Grid (if features page) or General Info */}
                {type === 'features' || type === 'generator' ? (
                     <section className="py-16 bg-slate-900 text-white px-6">
                        <div className="container mx-auto max-w-6xl">
                             <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
                             <div className="grid md:grid-cols-3 gap-8">
                                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                    <SparklesIcon className="w-10 h-10 text-indigo-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">AI Data Analysis</h3>
                                    <p className="text-slate-400">Use our AI data analysis tool to uncover trends hidden in your spreadsheets automatically.</p>
                                </div>
                                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                    <ChartAnalyticsIcon className="w-10 h-10 text-cyan-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Automated Charts</h3>
                                    <p className="text-slate-400">The advanced AI chart generator picks the best visualization format for your columns.</p>
                                </div>
                                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                    <LayoutIcon className="w-10 h-10 text-purple-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Drag & Drop Builder</h3>
                                    <p className="text-slate-400">A true dashboard builder online. Arrange widgets, resize charts, and export to PDF.</p>
                                </div>
                             </div>
                        </div>
                     </section>
                ) : null}

                {/* FAQ Section */}
                {type === 'faq' && (
                    <section className="py-16 bg-white px-6">
                         <div className="container mx-auto max-w-3xl">
                            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                            <div className="space-y-6">
                                {[
                                    { q: "Is this excel dashboard generator free?", a: "Yes, SheetSight offers a free tier to turn excel into dashboard visuals instantly." },
                                    { q: "Can I use this as a CSV dashboard tool?", a: "Absolutely. We support .csv, .xlsx, and .xls files." },
                                    { q: "Is my data secure?", a: "Yes. Processing happens in your browser. We don't store your raw spreadsheet data on our servers." },
                                    { q: "Do I need coding skills?", a: "None at all. This is a no-code dashboard tool designed for business users." }
                                ].map((item, i) => (
                                    <div key={i} className="border-b border-slate-200 pb-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.q}</h3>
                                        <p className="text-slate-600">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SeoPage;
