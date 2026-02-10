
import React from 'react';
import { Menu } from 'lucide-react';
import { User } from '../../types';

interface AppHeaderProps {
    currentUser: User;
    setIsSidebarOpen: (open: boolean) => void;
    changeView: (view: any) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    currentUser,
    setIsSidebarOpen,
    changeView
}) => {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 lg:hidden flex justify-between items-center">
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
                <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-blue-600 p-1.5 rounded-lg text-white text-xs">nu</span>
                ServiceDesk
            </h2>
            <div
                className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold cursor-pointer"
                onClick={() => changeView('profile')}
            >
                {currentUser.name[0]}
            </div>
        </header>
    );
};

export default AppHeader;
