"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldCheck, History, BookOpen, Activity, Settings, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/checklist', icon: ShieldCheck, label: 'Risk' },
  { href: '/live', icon: Activity, label: 'Live' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/playbooks', icon: BookOpen, label: 'Library' },
  { href: '/settings', icon: Settings, label: 'More' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 ios-glass safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-secondary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-secondary/10")} />
              <span className="text-[9px] font-bold tracking-tight uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
