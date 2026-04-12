import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, ShoppingBag, FileText, LogOut, Globe } from 'lucide-react';
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
    { key: 'nav_calendar', path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { key: 'nav_doctors',  path: '/doctors',   icon: Stethoscope,     label: 'Doctors'   },
    { key: 'nav_order',    path: '/orders',    icon: ShoppingBag,     label: 'Shop'      },
    { key: 'nav_report',   path: '/report',    icon: FileText,        label: 'Report'    },
  ];

  return (
    /* Hidden on mobile — only shows lg+ */
    <div className="hidden lg:flex w-64 bg-white/80 backdrop-blur-xl h-screen border-r border-pink-100 flex-col justify-between py-8 px-4 shadow-sm z-20 flex-shrink-0 fixed top-0 left-0">
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-4 mb-8">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-extrabold text-gray-800">CycleSakhi</span>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center mb-8 px-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B8A]/30 to-purple-200/30 flex items-center justify-center text-3xl mb-3 overflow-hidden border-4 border-white shadow-lg shadow-pink-100">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span>👩🏻</span>
            )}
          </div>
          <h2 className="text-sm font-bold text-gray-800">{user.name || 'User'}</h2>
          <span className="text-xs text-gray-500 bg-pink-50 px-3 py-1 rounded-full mt-1">Age: {user.age || '--'} yrs</span>
        </div>

        {/* Nav links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium relative ${
                  isActive
                    ? 'bg-pink-50 text-[#FF6B8A] font-semibold'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-[#FF6B8A]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B8A] rounded-r-full" />
                  )}
                  <item.icon size={20} />
                  <span>{t(item.key)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-2">
        {/* Language Toggle */}
        <div className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl bg-gray-50 border border-gray-100">
          <Globe size={18} className="text-[#FF6B8A] flex-shrink-0" />
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
          className="flex items-center gap-3 px-4 py-3 w-full min-h-[48px] text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} />
          {t('nav_logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;