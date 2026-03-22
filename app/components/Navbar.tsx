import Link from 'next/link';

export default function Navbar({ title = 'Ethereal' }: { title?: string }) {
  return (
    <nav className="h-24 flex items-center bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-50/50">
      <div className="container-custom flex items-center justify-between w-full gap-8">
        
        {/* Logo */}
        <Link href="/" className="text-3xl font-black tracking-tighter text-[#1A142E] serif flex-shrink-0">
          {title}
        </Link>

        {/* Desktop Nav Links - Shifted slightly left of center */}
        <div className="hidden xl:flex items-center gap-12 ml-4">
           {['Discover', 'Collections', 'Artisans'].map(link => (
             <Link key={link} href={`/${link.toLowerCase()}`} className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#6B6580] hover:text-[#8B7BB4] transition-all">
               {link}
             </Link>
           ))}
        </div>

        {/* Expanded Search Bar - Desktop Only */}
        <div className="hidden md:flex flex-1 max-w-2xl relative group">
           <input 
             type="text" 
             placeholder="Search for artisans, collections or pieces..."
             className="w-full bg-gray-50 border border-transparent rounded-[1.25rem] py-4 pl-14 pr-6 text-[13px] font-medium text-gray-600 focus:bg-white focus:border-[#E6E1F9] focus:shadow-2xl focus:shadow-purple-100 transition-all outline-none"
           />
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8B7BB4] transition-colors">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
           </svg>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-4 lg:gap-6 flex-shrink-0">
           {/* Mobile Search Trigger */}
           <button className="md:hidden p-2.5 text-gray-400 hover:text-[#8B7BB4] transition-all">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
           </button>

           <Link href="/cart" className="p-2.5 text-[#1A142E] relative group hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6h18" strokeLinecap="round"/><path d="M16 10a4 4 0 01-1 7.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="1.5" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#8B7BB4] text-[8px] font-black text-white flex items-center justify-center border-2 border-white">2</span>
           </Link>

           <Link href="/profile" className="hidden sm:flex p-2 flex-shrink-0 group hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-full border-2 border-gray-100 p-0.5 overflow-hidden group-hover:border-[#8B7BB4] transition-all">
                 <div className="w-full h-full rounded-full bg-purple-50 flex items-center justify-center text-[#8B7BB4]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-5 h-5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                 </div>
              </div>
           </Link>
        </div>

      </div>
    </nav>
  );
}
