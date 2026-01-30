import { useState } from 'react';
import { Search, ChevronDown, User as UserIcon, Calendar } from 'lucide-react';
import type { HeaderProps } from '../types/components';
import { useAuth } from '../context/AuthContext';

const Header = ({ title, showWelcome = false, hideSearch = false, hideDate = false, dateRange, onDateChange, searchTerm, onSearchChange }: HeaderProps) => {
    const { user } = useAuth();
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const userName = user?.name || 'User';
    const profilePicture = user?.profilePicture;

    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 order-2 sm:order-1">
                {showWelcome ? (
                    <div className="flex items-center gap-4">
                        <div className="lg:w-14 lg:h-14 w-12 h-12 rounded-full overflow-hidden border-2 border-primary-200 bg-primary-50 flex items-center justify-center">
                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-8 h-8 text-primary-400" />
                            )}
                        </div>
                        <div>
                            <h1 className="lg:text-2xl text-sm font-semibold text-gray-800">
                                Welcome Back, <span className="text-primary-600">{userName}</span>
                            </h1>
                            <p className="lg:text-sm text-xs text-gray-500">Here are your monthly store updates.</p>
                        </div>
                    </div>
                ) : (
                    <h1 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-800">{title}</h1>
                )}
            </div>

            <div className="flex items-center gap-4 order-1 sm:order-2 justify-end">
                {!hideSearch && (
                    <div className="hidden lg:block relative">
                        <input
                            type="text"
                            placeholder="Type here"
                            value={searchTerm || ''}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-[300px] pl-4 pr-4 py-2 text-sm border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                        />
                        <button className="absolute right-0 top-0 h-full px-4 bg-primary-600 text-white text-sm font-medium rounded-r-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                            <Search size={16} />
                            Search
                        </button>
                    </div>
                )}

                {!showWelcome && (
                    <div className="flex items-center gap-3">
                        {!hideDate && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                                    className="flex items-center gap-1 px-2 py-2 bg-primary-600 text-white rounded-lg md:text-sm text-xs font-medium hover:bg-primary-200 transition-colors"
                                >
                                    <Calendar size={16} />
                                    {dateRange || 'Select Date'}
                                    <ChevronDown size={16} className={`transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showDateDropdown && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        {[
                                            { label: 'Last 7 Days', value: '7days' },
                                            { label: 'Last 30 Days', value: '30days' },
                                            { label: 'This Month', value: 'thisMonth' },
                                            { label: 'All Time', value: 'allTime' }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    onDateChange?.(option.value);
                                                    setShowDateDropdown(false);
                                                }}
                                                className="w-full text-left px-2 py-2 md:text-sm text-xs text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="md:w-10 md:h-10 w-8 h-8 rounded-full overflow-hidden border-2 border-primary-200 bg-primary-50 flex items-center justify-center">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt={userName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="w-6 h-6 text-primary-400" />
                                )}
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-700">{userName}</span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
