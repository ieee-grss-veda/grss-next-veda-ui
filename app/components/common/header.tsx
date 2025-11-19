import React from 'react';
import { MetaNavigation } from './meta-navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ChevronDown,
  Database,
  BarChart3,
  Brain,
  Layers,
  Users,
  Map,
  Share2,
  Github,
  ArrowRight,
  Moon,
  Sun,
  Calendar,
  Clock,
  ExternalLink,
  Cpu,
} from 'lucide-react';
// import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
// import grssLogo from "figma:asset/884689818f77f15e97314310d167c0ac18ae8406.png";
// import grssLogoDark from "figma:asset/cf0076235cd0bd0d79d292edbdceace7c657c882.png";

export default function Header() {
  const currentMode = 'light';
  const logo = '';

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
              <button
                className='focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded transition-opacity hover:opacity-80'
                aria-label='Go to home page'
              >
                <img src={logo} alt='GRSS IEEE Logo' className='h-12' />
              </button>
              <div className='hidden lg:flex items-center gap-6'>
                <a
                  href='#'
                  className='hover:text-primary transition-colors focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
                >
                  Data Catalog
                </a>
                <a
                  href='#'
                  className='hover:text-primary transition-colors focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded flex items-center gap-1'
                >
                  Exploration Tools
                </a>
                <a
                  href='#'
                  className='hover:text-primary transition-colors focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
                >
                  Stories
                </a>

                {/* Story Variation Selector */}
                {/* <Select
                  value={storyVariation}
                  onValueChange={onStoryVariationChange}
                >
                  <SelectTrigger className='w-[200px] h-9'>
                    <SelectValue placeholder='Story Style' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='A'>Featured Stories</SelectItem>
                    <SelectItem value='D'>Stories Coming Soon</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='sm'
                // onClick={() =>
                //   onModeChange(currentMode === 'light' ? 'dark' : 'light')
                // }
                aria-label={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
              >
                {currentMode === 'light' ? (
                  <Moon className='h-4 w-4' />
                ) : (
                  <Sun className='h-4 w-4' />
                )}
              </Button>
              <Button variant='ghost' size='sm'>
                About
              </Button>
              <Button variant='ghost' size='sm'>
                Sign-in
              </Button>
              <Button size='sm' className='gap-2'>
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
