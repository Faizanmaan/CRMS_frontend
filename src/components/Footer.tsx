import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    const navLinks = [
        { label: 'Dashboard', path: '/' },
        { label: 'Customers', path: '/customers' },
        { label: 'Order Overview', path: '/orders' },
        { label: 'Analytics', path: '/analytics' },
        { label: 'Documents', path: '/documents' },
    ];

    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-[100%] mx-auto px-10 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <Link to="/" className="flex items-center gap-1 mb-2">
                            <span className="text-xl font-bold text-primary-700">swift</span>
                            <span className="text-xl font-bold text-gray-800">CRM</span>
                        </Link>
                        <p className="text-sm text-gray-500">
                            Crafting Connections, One Customer at a Time.
                        </p>
                    </div>

                    <nav className="flex flex-wrap gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <a
                            href="#"
                            className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                        >
                            <Facebook size={18} />
                        </a>
                        <a
                            href="#"
                            className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                        >
                            <Instagram size={18} />
                        </a>
                        <a
                            href="#"
                            className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                        >
                            <Twitter size={18} />
                        </a>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                    <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                        Privacy Policy
                    </Link>
                    <p className="text-sm text-gray-400">
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
