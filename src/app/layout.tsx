import React from 'react';
import "../styles/fonts.css";
import "../styles/globals.css";
import { metadata } from './metadata';
import SocialIcons from '../components/SocialIcons';
import StructuredData from '../components/StructuredData';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="canonical" href="https://untitledtrading.com" />
        <link rel="alternate" hrefLang="en-AU" href="https://untitledtrading.com" />
        <link rel="alternate" hrefLang="en" href="https://untitledtrading.com" />
        <link rel="alternate" hrefLang="x-default" href="https://untitledtrading.com" />
        <meta name="geo.placename" content="Adelaide" />
        <meta name="geo.region" content="AU-SA" />
        <meta name="geo.position" content="-34.9285;138.6007" />
        <meta name="ICBM" content="-34.9285, 138.6007" />
        <meta name="language" content="English" />
        <meta name="author" content="Untitled Trading" />
        <meta name="copyright" content="Copyright 2025 Untitled Trading" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <title>{metadata.title.default}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta name="robots" content={metadata.robots.index ? 'index,follow' : 'noindex,nofollow'} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:title" content={metadata.openGraph.title.default} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:locale" content="en_AU" />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:site" content={metadata.twitter.site} />
        <meta name="twitter:creator" content={metadata.twitter.creator} />
        <meta name="twitter:title" content={metadata.twitter.title.default} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.images} />
      </head>
      <body className="bg-black text-white">
        <StructuredData />
        {children}
        <SocialIcons />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};
