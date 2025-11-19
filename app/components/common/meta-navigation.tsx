/**
 * Enterprise-wide Meta-Navigation Component
 *
 * Universal top navigation bar per IEEE Digital Style Guide.
 * - Light mode: #FBFCFF background with dark text for contrast
 * - Dark mode: #000000 background with white text for sharp contrast
 * - Left-aligned core site links, right-aligned utility links
 * - WCAG AA compliant with clear hover and focus states
 * - Responsive design that adapts to smaller screens
 */

export function MetaNavigation() {
  return (
    <nav
      className='sticky top-0 z-50 w-full bg-[#FBFCFF] dark:bg-black text-foreground dark:text-white min-h-[40px] md:min-h-[100px] lg:min-h-[40px]'
      aria-label='IEEE Enterprise Navigation'
      role='navigation'
    >
      <div className='max-w-[1400px] mx-auto px-3 lg:px-6 h-full'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-2 py-1 md:py-1.5 lg:py-1'>
          {/* Left-aligned core site links */}
          <div className='flex flex-wrap items-center gap-1 text-sm'>
            <a
              href='https://www.ieee.org'
              className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
              target='_blank'
              rel='noopener noreferrer'
            >
              IEEE.org
            </a>
            <span
              className='text-foreground/60 dark:text-white/60'
              aria-hidden='true'
            >
              |
            </span>
            <a
              href='https://ieeexplore.ieee.org'
              className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
              target='_blank'
              rel='noopener noreferrer'
            >
              IEEE <span className='italic'>Xplore</span>
            </a>
            <span
              className='text-foreground/60 dark:text-white/60'
              aria-hidden='true'
            >
              |
            </span>
            <a
              href='https://standards.ieee.org'
              className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
              target='_blank'
              rel='noopener noreferrer'
            >
              IEEE Standards
            </a>
            <span
              className='text-foreground/60 dark:text-white/60'
              aria-hidden='true'
            >
              |
            </span>
            <a
              href='https://spectrum.ieee.org'
              className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
              target='_blank'
              rel='noopener noreferrer'
            >
              IEEE Spectrum
            </a>
            <span
              className='text-foreground/60 dark:text-white/60'
              aria-hidden='true'
            >
              |
            </span>
            <a
              href='https://www.ieee.org/sitemap.html'
              className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
              target='_blank'
              rel='noopener noreferrer'
            >
              More Sites
            </a>
          </div>

          {/* Right-aligned utility links */}
          <div className='flex flex-wrap items-center gap-1 text-sm'>
            <a
              href='https://www.ieee.org/membership/join/index.html'
              className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
              target='_blank'
              rel='noopener noreferrer'
            >
              Join IEEE
            </a>
            <span
              className='text-foreground/60 dark:text-white/60'
              aria-hidden='true'
            >
              |
            </span>
            <a
              href='https://www.ieee.org/give'
              className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
              target='_blank'
              rel='noopener noreferrer'
            >
              Donate
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
