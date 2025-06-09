'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { HomeIcon, ChartBarIcon, ArrowUpTrayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Upload Data', href: '/upload', icon: ArrowUpTrayIcon },
  { name: 'Donor Trends', href: '/dashboard', icon: ChartBarIcon },
  { name: 'About', href: '/about', icon: InformationCircleIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xl font-bold text-indigo-600"
              >
                Donor Analytics
              </motion.div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onMouseEnter={() => setIsHovered(item.name)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {isHovered === item.name && !isActive && (
                      <motion.div
                        layoutId="hoverIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
} 