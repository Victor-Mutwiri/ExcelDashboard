import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="py-12 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Logo className="w-8 h-8 text-indigo-500" />
                            <span className="text-xl font-bold font-['Montserrat']">
                                <span style={{ color: 'var(--logo-color-sheet)' }}>Sheet</span>
                                <span style={{ color: 'var(--logo-color-sight)' }}>Sight</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">
                            The ultimate no-code dashboard generator. Turn Excel and CSV files into interactive insights instantly.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/app" className="hover:text-indigo-600">Dashboard Tool</Link></li>
                            <li><Link to="/features" className="hover:text-indigo-600">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-indigo-600">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Use Cases</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/dashboard-generator" className="hover:text-indigo-600">Excel Dashboard Generator</Link></li>
                            <li><Link to="/excel-to-dashboard" className="hover:text-indigo-600">Convert Excel to Dashboard</Link></li>
                            <li><Link to="/csv-dashboard-tool" className="hover:text-indigo-600">CSV Dashboard Tool</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/faq" className="hover:text-indigo-600">FAQ</Link></li>
                            <li><Link to="/blog" className="hover:text-indigo-600">Blog</Link></li>
                            <li><Link to="/support" className="hover:text-indigo-600">Help Center</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} SheetSight. All rights reserved.</p>
                    <p className="mt-2 text-xs text-slate-400">
                        AI data analysis tool • Automated data visualizations • Online dashboard creator
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
