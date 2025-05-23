import { Anchor as ManAnchor, AnchorProps as ManAnchorProps } from '@mantine/core';
import { PropsWithChildren } from 'react';
import styles from './Anchor.styles.module.scss';
import { OmitStyles } from '@/ui-kit/utils';

export interface AnchorProps extends OmitStyles<ManAnchorProps>, PropsWithChildren {
  href: string;
  download: string;
}

export function Anchor({ children, ...props }: AnchorProps) {
  return (
    <ManAnchor className={styles.anchor} {...props}>
      {children}
    </ManAnchor>
  );
}
