'use client';

import styles from './page.module.css';

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google/login';
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button onClick={handleGoogleLogin}>Log in with google</button>
      </main>
    </div>
  );
}
