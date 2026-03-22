'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const strips = [
  { label: 'Discover',   href: '/',       icon: HomeIcon },
  { label: 'Browse',     href: '/browse', icon: GridIcon },
  { label: 'Saved',      href: '/saved',  icon: HeartIcon },
  { label: 'Profile',    href: '/profile', icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 glass rounded-[2.5rem] border border-white/50 shadow-2xl px-8 py-4 flex justify-between items-center transition-all duration-500">
        {strips.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="relative group">
              <div className={`transition-all duration-300 ${active ? 'text-[#8B7BB4] scale-110' : 'text-gray-400 opacity-60'}`}>
                <Icon size={24} active={active} />
              </div>
              {active && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8B7BB4]" />
              )}
            </Link>
          );
        })}
    </nav>
  );
}

function HomeIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M21 12v9H3v-9"/>
    </svg>
  );
}
function GridIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function HeartIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
function UserIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
