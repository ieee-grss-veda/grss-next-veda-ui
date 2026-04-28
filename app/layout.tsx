import './globals.css';
import Header from './components/common/header';
import { ThemeProvider } from './components/common/theme-provider';
import { WebsiteTourProvider } from './components/common/website-tour';
import Footer from './components/common/footer';
import CookiesBanner from './components/cookies';
import React from 'react';

export const metadata = {
  title: 'GRSS VEDA | IEEE',
  description:
    "Geoscience and Remote Sensing Society's (GRSS) Visualization, Exploration, and Data Analysis (VEDA)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />

        {/*  v ieee cookie banner v  */}
        <script src='https://cmp.osano.com/AzyzptTmRlqVd2LRf/de836d52-6a96-4ecd-b0ed-945c5684d0a9/osano.js'></script>
        <link
          rel='stylesheet'
          href='https://cookie-consent.ieee.org/ieee-cookie-banner.css'
          type='text/css'
        />
        {/*  ^ ieee cookie banner ^  */}
      </head>
      <body>
        <ThemeProvider>
          <WebsiteTourProvider>
            <div
              className='min-h-screen bg-background text-foreground'
              lang='en'
            >
              <Header />
              <div>{children}</div>
              <Footer />
              {/* <CookiesBanner /> */}
            </div>
          </WebsiteTourProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
