import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SubMenuItem {
  name: string;
  path: string;
  children?: SubMenuItem[];
}

interface SubMenuProps {
  title: string;
  items: SubMenuItem[];
  isOpen: boolean;
  onToggle: () => void;
  parentPath: string;
}

const SubMenu: React.FC<SubMenuProps> = ({ title, items, isOpen, onToggle, parentPath }) => {
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (itemName: string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const renderMenuItem = (item: SubMenuItem, level: number = 0) => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isSubMenuOpen = openSubMenus[item.name];
    const paddingLeft = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';

    return (
      <div key={item.name}>
        {hasChildren ? (
          <button
            onClick={() => toggleSubMenu(item.name)}
            className={`w-full flex items-center justify-between ${paddingLeft} pr-4 py-2 text-sm transition-colors hover:bg-slate-100 rounded-lg ${
              isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            <span>{item.name}</span>
            {isSubMenuOpen ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        ) : (
          <Link
            to={item.path}
            className={`block ${paddingLeft} pr-4 py-2 text-sm transition-colors hover:bg-slate-100 rounded-lg ${
              isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            {item.name}
          </Link>
        )}
        
        {hasChildren && isSubMenuOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-2">
      {title && (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors rounded-lg ${
            location.pathname.startsWith(parentPath)
              ? 'bg-emerald-500 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>{title}</span>
          {isOpen ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
      )}
      
      {(isOpen || !title) && (
        <div className={title ? "mt-2 space-y-1" : "space-y-1"}>
          {items.map(item => renderMenuItem(item))}
        </div>
      )}
    </div>
  );
};

export default SubMenu;
