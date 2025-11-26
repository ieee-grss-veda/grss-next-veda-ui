import { InternalNavLink } from '@lib';
import Link from 'next/link';
import React from 'react';

export default function Footer() {
  const navItems: InternalNavLink[] = [
    {
      id: 'home',
      title: 'Home',
      to: '/',
      type: 'internalLink',
    },
    {
      id: 'sitemap',
      title: 'Sitemap',
      to: '/#',
      type: 'internalLink',
    },
    {
      id: 'contact-support',
      title: 'Contact & Support',
      to: '/#',
      type: 'internalLink',
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      to: 'https://www.ieee.org/accessibility-statement',
      type: 'internalLink',
    },
    {
      id: 'nondiscrimination-policy',
      title: 'Nondiscrimination Policy',
      to: 'https://www.ieee.org/about/corporate/governance/p9-26',
      type: 'internalLink',
    },
    {
      id: 'ethics-reporting',
      title: 'IEEE Ethics Reporting',
      to: 'https://secure.ethicspoint.com/domain/media/en/gui/20410/index.html',
      type: 'internalLink',
    },
    {
      id: 'privacy-policy',
      title: 'IEEE Privacy Policy',
      to: 'https://privacy.ieee.org/policies',
      type: 'internalLink',
    },
    {
      id: 'terms-disclosures',
      title: 'Terms & Disclosures',
      to: 'https://www.ieee.org/about/help/site-terms-conditions',
      type: 'internalLink',
    },
    {
      id: 'feedback',
      title: 'Feedback',
      to: 'https://www.ieee.org/about/feedback-ieee-site',
      type: 'internalLink',
    },
  ];
  return (
    <footer className='border-t border-border bg-card mt-16'>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12 py-12'>
        <div className='flex flex-wrap gap-4 mb-8 text-sm'>
          {navItems.map((item, index) => (
            <>
              <Link
                href={item.to}
                className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
              >
                {item.title}
              </Link>
              {index < navItems.length - 1 && (
                <span className='text-muted-foreground'>|</span>
              )}
            </>
          ))}
        </div>
        <div className='space-y-2 text-sm text-muted-foreground'>
          <p>
            © Copyright 2025 IEEE – All rights reserved. A public charity. IEEE
            is the world's largest technical professional organization dedicated
            to advancing technology for the benefit of humanity.
          </p>
        </div>
      </div>
    </footer>
  );
}
