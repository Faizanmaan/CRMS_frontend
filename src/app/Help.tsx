import React from 'react';
import {
    HelpCircle,
    LayoutDashboard,
    Users,
    ShoppingCart,
    BarChart3,
    FileText,
    Bell,
    Shield,
    Package,
    Search,
    BookOpen,
    MessageCircle
} from 'lucide-react';

const Help: React.FC = () => {
    const sections = [
        {
            title: 'Dashboard Overview',
            icon: <LayoutDashboard className="w-6 h-6 text-blue-500" />,
            content: 'The dashboard provides a high-level summary of your CRM activities. You can track total customers, active products, monthly income, and target orders at a glance. It also features a real-time sales chart and a list of recently added customers.'
        },
        {
            title: 'Customer Management',
            icon: <Users className="w-6 h-6 text-green-500" />,
            content: 'Manage your client base efficiently. You can add new customers, view detailed profiles, and track their interactions. Use the search and filter options to quickly find specific customers and manage their data.'
        },
        {
            title: 'Order Tracking',
            icon: <ShoppingCart className="w-6 h-6 text-orange-500" />,
            content: 'Keep track of all sales and orders. The Order Overview page displays a chronological list of transactions, including customer details, product information, and order status. You can filter orders by date range to analyze specific periods.'
        },
        {
            title: 'Product Catalog',
            icon: <Package className="w-6 h-6 text-purple-500" />,
            content: 'Maintain your inventory with ease. Admins can upload new products, set prices, and manage stock levels. Customers can browse available products and select items to add to their own lists.'
        },
        {
            title: 'Analytics & Insights',
            icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
            content: 'Gain valuable insights into your business performance. The Analytics page provides detailed statistics on sales history, customer growth, and best-selling products. Use these metrics to make data-driven decisions.'
        },
        {
            title: 'Document Management',
            icon: <FileText className="w-6 h-6 text-red-500" />,
            content: 'Securely store and share important files. Both admins and customers can upload documents, manage versions, and control visibility. Supports bulk actions for efficient document handling.'
        },
        {
            title: 'Activity Notifications',
            icon: <Bell className="w-6 h-6 text-yellow-500" />,
            content: 'Stay informed with real-time updates. The notification system logs all key activities, such as new registrations, product updates, and document uploads. Each notification includes details about the actor and the action performed.'
        },
        {
            title: 'Role-Based Access',
            icon: <Shield className="w-6 h-6 text-cyan-500" />,
            content: 'The system uses a robust role-based access control (RBAC) model. Super Admins have full control, Admins manage day-to-day operations, and Customers have access to their specific dashboards and tools.'
        }
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
                    <HelpCircle className="w-10 h-10 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">How can we help you?</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Welcome to the SwiftCRM Help Center. Here you can find everything you need to know about navigating and using our platform effectively.
                </p>
            </div>

            <div className="relative mb-12">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search for help topics..."
                    className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {sections.map((section, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

                <h2 className="text-3xl font-bold mb-4 relative z-10">Still have questions?</h2>
                <p className="text-indigo-100 mb-8 max-w-xl mx-auto relative z-10">
                    Our support team is always here to help. Reach out to us through any of the channels below and we'll get back to you as soon as possible.
                </p>

                <div className="flex flex-wrap justify-center gap-4 relative z-10">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        Live Chat
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl border border-indigo-400 hover:bg-indigo-400 transition-colors">
                        <BookOpen className="w-5 h-5" />
                        Documentation
                    </button>
                </div>
            </div>

            <div className="mt-16 text-center text-gray-400 text-sm">
                <p>© 2026 SwiftCRM. All rights reserved. Built with passion for better relationships.</p>
            </div>
        </div>
    );
};

export default Help;
