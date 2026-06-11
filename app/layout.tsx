import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'PDX Compass',
  description: 'Community Help Exchange platform by The Humble Travelers Foundation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Hide the default ugly Google Translate top banner bar */}
        <style>{`
          .goog-te-banner-frame { display: none !important; }
          body { top: 0px !important; }
          .skiptranslate { font-family: inherit !important; }
        `}</style>
      </head>
      <body>
        {children}
        
        {/* Google Translate Integration Scripts */}
        <Script id="google-translate-config" strategy="beforeInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script 
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}
