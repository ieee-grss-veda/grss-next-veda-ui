export default function Footer() {
  return (
    <footer className='border-t border-border bg-card mt-16'>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12 py-12'>
        <div className='flex flex-wrap gap-4 mb-8 text-sm'>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            Home
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            Sitemap
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            Contact & Support
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='https://www.ieee.org/accessibility_statement.html'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            Accessibility
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            Nondiscrimination Policy
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            IEEE Ethics Reporting
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            IEEE Privacy Policy
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            Terms & Disclosures
          </a>
          <span className='text-muted-foreground'>|</span>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
          >
            Feedback
          </a>
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
