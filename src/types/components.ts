import type { ReactNode } from 'react';

export interface NavItem {
    label: string;
    icon: ReactNode;
    path: string;
    subItems?: { label: string; path: string }[];
}

export interface HeaderProps {
    title: string;
    showWelcome?: boolean;
    hideSearch?: boolean;
    hideDate?: boolean;
    dateRange?: string;
    onDateChange?: (range: string) => void;
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}
