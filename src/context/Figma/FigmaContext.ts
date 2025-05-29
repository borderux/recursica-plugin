import { createContext } from 'react';
import { VariableJSONCollection } from '@/plugin/types';
import { ProjectTypes } from '@/plugin/projectMetadataCollection';

export interface MetadataContext {
  projectId: string;
  projectType: ProjectTypes;
  theme?: string;
  pluginVersion: string;
}

export interface IconsContext {
  [key: string]: string;
}

export interface IFigmaContext {
  variables?: VariableJSONCollection;
  svgIcons?: IconsContext;
  metadata?: MetadataContext;
}

export const FigmaContext = createContext<IFigmaContext>(null!);
