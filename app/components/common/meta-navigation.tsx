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

import { InternalNavLink } from '@lib';
import Link from 'next/link';
import React from 'react';

export function MetaNavigation() {
  const navItems: InternalNavLink[] = [
    {
      id: 'ieee-org',
      title: 'IEEE.org',
      to: 'https://www.ieee.org',
      type: 'internalLink',
    },
    {
      id: 'ieee-explore',
      title: `IEEE Xplore`,
      to: 'https://ieeexplore.ieee.org',
      type: 'internalLink',
    },
    {
      id: 'ieee-standards',
      title: 'IEEE Standards',
      to: 'https://standards.ieee.org',
      type: 'internalLink',
    },
    {
      id: 'ieee-spectrum',
      title: 'IEEE Spectrum',
      to: 'https://spectrum.ieee.org',
      type: 'internalLink',
    },
    {
      id: 'more-sites',
      title: 'More Sites',
      to: 'https://www.ieee.org/sitemap.html',
      type: 'internalLink',
    },
  ];

  const rightNavItems: InternalNavLink[] = [
    {
      id: 'join-ieee',
      title: 'Join IEEE',
      to: 'https://www.ieee.org/membership/join/index.html',
      type: 'internalLink',
    },
    {
      id: 'donate',
      title: `Donate`,
      to: 'https://www.ieee.org/give',
      type: 'internalLink',
    },
  ];

  return (
    <nav
      className='sticky top-0 z-50 w-full bg-[#FBFCFF] dark:bg-black text-foreground dark:text-white min-h-10'
      aria-label='IEEE Enterprise Navigation'
      role='navigation'
    >
      <div className='max-w-[1400px] mx-auto px-3 lg:px-6 h-full'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-2 py-1 md:py-1.5 lg:py-1'>
          {/* Left-aligned core site links */}
          <div className='flex flex-wrap items-center gap-1 text-sm'>
            {navItems.map((item, index) => (
              <div key={index} className='flex gap-1'>
                <Link
                  href={item.to}
                  className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {item.id === 'ieee-explore' ? (
                    <>
                      IEEE <span className='italic'>Xplore</span>{' '}
                    </>
                  ) : (
                    item.title
                  )}
                </Link>
                {index < navItems.length - 1 && (
                  <span
                    className='text-foreground/60 dark:text-white/60'
                    aria-hidden='true'
                  >
                    |
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Right-aligned utility links */}
          <div className='flex flex-wrap items-center gap-1 text-sm'>
            {rightNavItems.map((item, index) => (
              <div key={index} className='flex gap-1'>
                <Link
                  href={item.to}
                  className='text-foreground dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FBFCFF] dark:focus:ring-offset-black rounded px-0.5 transition-all'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {item.title}
                </Link>
                {index < rightNavItems.length - 1 && (
                  <span
                    className='text-foreground/60 dark:text-white/60'
                    aria-hidden='true'
                  >
                    |
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
