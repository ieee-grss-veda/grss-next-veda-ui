import './globals.css';
import Header from './components/common/header';
import { ThemeProvider } from './components/common/theme-provider';
import { WebsiteTourProvider } from './components/common/website-tour';
import Footer from './components/common/footer';
import CookiesBanner from './components/cookies';
import AwsRumInit from './components/aws-rum';
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
        <script
          data-jsd-embedded
          data-key='257a3422-6a25-4a9e-92b1-c195ecd45fc6'
          data-base-url='https://jsd-widget.atlassian.com'
          src='https://jsd-widget.atlassian.com/assets/embed.js'
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.showCollectorDialog = function() {
                try {
                  var iframe = document.getElementById('jsd-widget');
                  if (iframe) {
                    iframe.classList.add('jsd-widget-open');
                    var iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                    var button = iframeContent.getElementById('help-button');
                    if (button) {
                      button.click();
                    }
                    // Watch for widget close
                    var observer = new MutationObserver(function(mutations) {
                      mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                          var height = parseInt(iframe.style.height);
                          if (height <= 80) {
                            iframe.classList.remove('jsd-widget-open');
                            observer.disconnect();
                          }
                        }
                      });
                    });
                    observer.observe(iframe, { attributes: true });
                  }
                } catch(e) {
                  console.log('Could not open widget:', e);
                }
              };
            `,
          }}
        />
      </head>
      <body>
        <AwsRumInit />
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
