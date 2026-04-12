import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, Stethoscope, ShoppingBag, FileText, LogOut, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const navItems = [
    { key: 'nav_calendar', path: '/dashboard', icon: CalendarDays },
    { key: 'nav_doctors',  path: '/doctors',   icon: Stethoscope },
    { key: 'nav_order',    path: '/orders',    icon: ShoppingBag },
    { key: 'nav_report',   path: '/report',    icon: FileText },
  ];

  return (
    <div className="w-72 bg-white/80 backdrop-blur-xl h-full border-r border-white/60 flex flex-col justify-between py-8 px-6 shadow-sm z-20 flex-shrink-0">
      <div>
        {/* Profile */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B8A]/30 to-purple-200/30 flex items-center justify-center text-4xl mb-4 overflow-hidden border-4 border-white shadow-lg shadow-pink-100">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>👩🏻</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-800">{user.name || 'User'}</h2>
          <span className="text-sm text-gray-500 bg-pink-50 px-3 py-1 rounded-full mt-1">Age: {user.age || '--'} yrs</span>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6B8A]/10 to-pink-50 text-[#FF6B8A]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B8A] rounded-r-full" />
                  )}
                  <item.icon size={20} />
                  {t(item.key)}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-2">
        {/* Language Toggle */}
        <div className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl bg-gray-50 border border-gray-100">
          <Globe size={18} className="text-[#FF6B8A]" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-sm font-medium cursor-pointer text-gray-700"
          >
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 हिंदी</option>
            <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
          </select>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} />
          {t('nav_logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;