import NextLink from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <NextLink href="/" passHref>
          <a>
            <img src="/assets/logo.svg" alt="logo" />
          </a>
        </NextLink>
      </div>
    </header>
  );
}
