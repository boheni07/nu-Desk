
import React from 'react';
import { UserRole } from '../../types';

interface NavItemProps {
    icon: any;
    label: string;
    targetView: string;
    currentView: string;
    currentUserRole: UserRole;
    onClick: (view: any) => void;
    adminOnly?: boolean;
    supportOrAdmin?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    targetView,
    currentView,
    currentUserRole,
    onClick,
    adminOnly = false,
    supportOrAdmin = false
}) => {
    if (adminOnly && currentUserRole !== UserRole.ADMIN) return null;
    if (supportOrAdmin && (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.SUPPORT_LEAD && currentUserRole !== UserRole.SUPPORT_STAFF && currentUserRole !== UserRole.CUSTOMER)) return null;

    const isActive = currentView === targetView;

    return (
        <button
            onClick={() => onClick(targetView)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="text-sm">{label}</span>
        </button>
    );
};

export default NavItem;
