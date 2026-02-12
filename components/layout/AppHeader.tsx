
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 py-2 lg:hidden flex justify-between items-center">
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
                <Menu size={24} />
            </button>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span className="bg-blue-600 px-1.5 py-0.5 rounded-md text-white text-[10px]">nu</span>
                Desk
            </h2>
            <div
                className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold cursor-pointer text-sm"
                onClick={() => changeView('profile')}
            >
                {currentUser.name[0]}
            </div>
        </header>
    );
};

export default AppHeader;
