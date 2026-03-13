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
import { usePathname } from 'next/navigation';
import { cn } from '../ui/utils';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
        className='sticky top-[40px] z-40 border-b border-border bg-card'
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
                  src='/images/GRSS-lightmode-logo.png'
                  alt='GRSS IEEE Logo'
                  className='logo-light h-12'
                />
                <img
                  src='/images/GRSS-darkmode-logo.png'
                  alt='GRSS IEEE Logo'
                  className='logo-dark h-12'
                />
              </Link>
              <div className='hidden md:flex items-center gap-6'>
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.to}
                    data-tour={item.id}
                    className={cn(
                      'hover:text-primary transition-colors rounded',
                      pathname === item.to ? 'text-primary' : ''
                    )}

                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='sm'
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className='flex'
                data-tour='theme-toggle'
              >
                {theme === 'light' ? (
                  <Moon className='h-4 w-4' />
                ) : (
                  <Sun className='h-4 w-4' />
                )}
              </Button>
              
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
                  <nav className='flex flex-col gap-4 mt-8 p-2'>
                    <div className='flex flex-col gap-4 md:hidden'>
                      {navItems.map((item) => (
                        <Button
                          asChild
                          variant='ghost'
                          className='justify-start text-lg py-6'
                        >
                          <Link
                            key={item.id}
                            href={item.to}
                            className={cn(
                              pathname === item.to ? 'text-primary' : ''
                            )}
                          >
                            <span className='inline-block' onClick={() => setMobileMenuOpen(false)}>{item.title}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>

                    <Separator className='md:hidden' />

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

                    <Separator className='md:hidden' />

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
                asChild
                variant='ghost'
                size='sm'
                className='hidden lg:flex'
                data-tour='about'
              >
                <Link href='/about'>About</Link>
              </Button>
              <Button variant='ghost' size='sm' className='hidden lg:flex' asChild>
                <Link href={process.env.NEXT_PUBLIC_AUTH_DOMAIN ? `${process.env.NEXT_PUBLIC_AUTH_DOMAIN}/realms/veda/account/applications` : '#'}>
                  Sign-in
                </Link>
              </Button>
              <Link href='https://grss-ieee.atlassian.net/servicedesk/'>
                <Button size='sm' className='gap-2 hidden lg:flex' data-tour='contact'>
                    Contact Us <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
