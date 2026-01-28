import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="md:hidden">
                <Sidebar />
            </div>

            <div className="flex flex-1">
                <aside className="hidden md:block py-6 ps-6">
                    <div className="sticky top-6">
                        <Sidebar />
                    </div>
                </aside>

                <main className="flex-1 p-6 pt-20 md:pt-6">
                    <Outlet />
                </main>

            </div>

            <Footer />
        </div>
    );
};

export default Layout;
