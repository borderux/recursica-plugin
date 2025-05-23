import { OmitStyles } from '@/ui-kit/utils';
import styles from './Button.styles.module.scss';
import { Button as ManButton, ButtonProps as ManButtonProps } from '@mantine/core';

export interface ButtonProps extends OmitStyles<ManButtonProps> {}
export function Button({ children, p = 'sm', ...props }: ButtonProps) {
  return (
    <ManButton className={styles.button} p={p} {...props}>
      {children}
    </ManButton>
  );
}
