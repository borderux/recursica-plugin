import { createContext } from 'react';
import { ExportedVariable } from '@/plugin/types';

export interface TokensContext {
  codeTokens?: string;
  accordionTokens?: {
    [key: string]: ExportedVariable[];
  };
}

export interface MetadataContext {
  filename: string;
  version: string;
}

export interface IFigmaContext {
  tokens: TokensContext;
  metadata: MetadataContext;
}

export const FigmaContext = createContext<IFigmaContext>(null!);
