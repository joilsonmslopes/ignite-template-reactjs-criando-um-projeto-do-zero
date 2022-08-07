import { ReactNode } from 'react';
import styles from './button.module.scss';

interface ButtonProps {
  children: ReactNode;
  onGetPostPagination: () => void;
}

export const Button = ({
  children,
  onGetPostPagination,
}: ButtonProps): JSX.Element => (
  <button
    onClick={() => onGetPostPagination()}
    type="button"
    className={styles.button}
  >
    {children}
  </button>
);
