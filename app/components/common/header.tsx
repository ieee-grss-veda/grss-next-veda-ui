'use client';

import { ArrowRight, Menu, Moon, Sun } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { MetaNavigation } from './meta-navigation';
// import { ImageWithFallback } from './figma/ImageWithFallback';
import { InternalNavLink } from '@lib';
import {
  DATASET_CATALOG_PATH,
  EXPLORATION_PATH,
  STORY_HUB_PATH,
} from 'app/config';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { useTheme } from './theme-provider';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: InternalNavLink[] = [
    {
      id: 'data-catalog',
      title: 'Data Catalog',
      to: `/${DATASET_CATALOG_PATH}`,
      type: 'internalLink',
    },
    {
      id: 'exploration',
      title: 'Exploration',
      to: `/${EXPLORATION_PATH}`,
      type: 'internalLink',
    },
    {
      id: 'stories',
      title: 'Stories',
      to: `/${STORY_HUB_PATH}`,
      type: 'internalLink',
    },
  ];

  return (
    <>
      <MetaNavigation />
      <nav
        className='sticky top-[40px] md:top-[100px] lg:top-[40px] z-40 border-b border-border bg-card'
        aria-label='Main navigation'
      >
        <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
          <div className='flex items-center justify-between h-20'>
            <div className='flex items-center gap-8'>
              <Link
                href='/'
                className='focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded transition-opacity hover:opacity-80 cursor-pointer'
                aria-label='Go to home page'
                data-tour='logo'
              >
                <img
                  src={
                    theme === 'dark'
                      ? '/images/GRSS-darkmode-logo.png'
                      : '/images/GRSS-lightmode-logo.png'
                  }
                  alt='GRSS IEEE Logo'
                  className='h-12'
                />
              </Link>
              <div className='hidden lg:flex items-center gap-6'>
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.to}
                    className='hover:text-primary transition-colors focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
                    data-tour={item.id}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='lg:hidden'
                    aria-label='Open menu'
                  >
                    <Menu className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
                  <nav className='flex flex-col gap-4 mt-8'>
                    <a
                      href='#'
                      className='text-lg hover:text-primary transition-colors py-2'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Data Catalog
                    </a>
                    <a
                      href='#'
                      className='text-lg hover:text-primary transition-colors py-2'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Exploration Tools
                    </a>
                    <a
                      href='#'
                      className='text-lg hover:text-primary transition-colors py-2'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Stories
                    </a>

                    <Separator className='my-4' />

                    <Button
                      asChild
                      variant='ghost'
                      className='justify-start text-lg py-6'
                    >
                      <Link
                        href='/about'
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        About
                      </Link>
                    </Button>

                    <Button
                      variant='ghost'
                      className='justify-start text-lg py-6'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign-in
                    </Button>

                    <Button
                      className='w-full justify-center'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact Us
                      <ArrowRight className='h-4 w-4 ml-2' />
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Desktop Actions */}
              <Button
                variant='ghost'
                size='sm'
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className='hidden lg:flex'
                data-tour='theme-toggle'
              >
                {theme === 'light' ? (
                  <Moon className='h-4 w-4' />
                ) : (
                  <Sun className='h-4 w-4' />
                )}
              </Button>
              <Button
                asChild
                variant='ghost'
                size='sm'
                className='hidden lg:flex'
                data-tour='about'
              >
                <Link href='/about'>About</Link>
              </Button>
              <Button variant='ghost' size='sm' className='hidden lg:flex'>
                Sign-in
              </Button>
              <Button size='sm' className='gap-2' data-tour='contact'>
                Contact Us
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
