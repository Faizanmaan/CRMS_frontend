import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    const navLinks = [
        { label: 'Dashboard', path: '/' },
        { label: 'Customers', path: '/customers' },
        { label: 'Order Overview', path: '/orders' },
        { label: 'Analytics', path: '/analytics' },
        { label: 'Accounting', path: '/accounting' },
    ];

    return (
        <footer className="bg-white mt-auto">
            <div className="max-w-full mx-auto px-10 py-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center items-start gap-6 mb-6">

                    {/* Left Side: Logo + Tagline */}
                    <div className="flex flex-col items-start gap-2">
                        <Link to="/" className="flex items-center gap-0.5">
                            <span className="text-2xl font-bold text-gray-800">swift</span>
                            <span className="text-2xl font-bold text-primary-600">CRM</span>
                        </Link>

                        <p className="text-sm text-gray-600 text-start md:text-left">
                            Crafting Connections, One Customer at a Time.
                        </p>
                    </div>

                    {/* Right Side: Nav Links + Social Icons */}
                    <div className="flex flex-col items-start md:items-end gap-6">

                        <nav className="flex flex-wrap flex-col md:flex-row justify-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white transition-colors"
                            >
                                <Facebook size={16} />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white transition-colors"
                            >
                                <Instagram size={16} />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white transition-colors"
                            >
                                <Twitter size={16} />
                            </a>
                        </div>

                    </div>
                </div>


                {/* Bottom Row: Links and Copyright */}
                <div className="flex flex-col md:flex-row justify-between md:items-center items-start gap-4 pt-6 border-t border-gray-200">
                    <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                        Privacy Policy
                    </Link>
                    <p className="text-sm text-gray-500">
                        © 2023 Mugna Technologies, Inc.
                    </p>
                    <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
