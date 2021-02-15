import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js Middleware Example</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <p>
        Checkout the code in the <b>middleware</b> folder and <b>api</b> folder
        to explore how to create middleware in Next.js.
      </p>
    </div>
  );
}
