import type { AppProps } from 'next/app';
import Head from 'next/head';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      
      <Component {...pageProps} />
    </UserProvider>
  );
}
