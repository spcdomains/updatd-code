import { AppProps } from "next/app";
import "../styles/globals.css";
import Head from "next/head";
import Message from '../Components/Message'
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import logo from '@/public/logo-removebg-preview.png'; // Ensure this is the correct path for your logo

function MyApp({ Component, pageProps }: AppProps) {
  const title = pageProps.title || 'spcreferprogram';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Explore the ultimate collection of digital solutions at Butterfly Digital Solutions Pvt. Ltd. From innovative web design to advanced SEO services, we help your business thrive online. Contact us today for custom-tailored digital strategies." />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Aclonica&display=swap" rel="stylesheet" />

        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      {/* <Navbar /> */}
      <Component {...pageProps} />
      <Message/>
    </>
  );
}

export default MyApp;
