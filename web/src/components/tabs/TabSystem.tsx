/**
 * TabSystem - Système d'onglets réutilisable
 * Features:
 * - Onglets personnalisables
 * - Animation fluide entre les onglets
 * - Support pour les badges (notifications, etc.)
 * - Dark mode styling
 */

import type { ReactNode } from 'react';
import { Users, Settings } from 'lucide-react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export default function TabSystem({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
}: TabSystemProps) {
  if (variant === 'underline') {
    return (
      <div className="border-b border-white/10">
        <nav className="flex gap-6 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-brand-blue'
                  : 'text-gray-400 hover:text-white'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-500 text-white">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
              )}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`
              relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
              ${activeTab === tab.id
                ? 'bg-brand-blue text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-orange-500 text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={`
            relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${activeTab === tab.id
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
            }
            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
