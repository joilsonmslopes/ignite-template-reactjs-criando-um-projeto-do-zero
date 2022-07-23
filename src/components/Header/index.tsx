import NextLink from 'next/link';
import styles from './header.module.scss';

export const Header = () => {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <NextLink href="/">
          <a>
            <img src="/assets/logo.svg" alt="logo" />
          </a>
        </NextLink>
      </div>
    </header>
  );
};
