import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, ShoppingBag, FileText, User } from 'lucide-react';

const TABS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home'     },
  { path: '/doctors',   icon: Stethoscope,     label: 'Doctors'  },
  { path: '/orders',    icon: ShoppingBag,     label: 'Shop'     },
  { path: '/report',    icon: FileText,         label: 'Report'   },
];

const BottomTabBar = () => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-pink-100 flex items-center justify-around"
    style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(64px + env(safe-area-inset-bottom))' }}
  >
    {TABS.map(({ path, icon: Icon, label }) => (
      <NavLink
        key={path}
        to={path}
        end={path === '/dashboard'}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 px-3 py-1 flex-1 transition-colors ${
            isActive ? 'text-[#FF6B8A]' : 'text-gray-400 hover:text-gray-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              size={24}
              strokeWidth={isActive ? 2.5 : 1.8}
              className={isActive ? 'text-[#FF6B8A]' : 'text-gray-400'}
            />
            <span className="text-[10px] font-semibold">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default BottomTabBar;
