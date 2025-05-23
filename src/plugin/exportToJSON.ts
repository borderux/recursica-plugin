import { CollectionType, CollectionVariable } from './types';
import { toFontWeight } from './utils';
import { processVariableCollection } from './variables';

export interface fileMetadata {
  filetype: string;
  filename: string;
  version: string;
}

async function decodeVariableCollections() {
  const parsedCollections = [];
  // Get local variable collections
  const rawVariables = await figma.variables.getLocalVariableCollectionsAsync();
  for (const variableCollection of rawVariables) {
    parsedCollections.push(await processVariableCollection(variableCollection));
  }
  return parsedCollections;
}

async function decodeTypographyStyles() {
  // Get local typographies
  const parsedTypographies: CollectionVariable[] = [];
  const rawTypographies = await figma.getLocalTextStylesAsync();
  for (const {
    name,
    description,
    fontName: { family: fontFamily, style: fontWeight },
    fontSize,
  } of rawTypographies) {
    parsedTypographies.push({
      name,
      description,
      type: 'typography',
      value: {
        fontFamily,
        fontSize,
        fontWeight: toFontWeight(fontWeight),
        fontWeightAlias: fontWeight,
      },
    });
  }
  return {
    name: 'typography',
    modes: [
      {
        id: '',
        name: 'local-typography-styles',
        variables: parsedTypographies,
      },
    ],
  };
}

async function decodeEffectStyles() {
  // Get local effects
  const parsedEffects: CollectionVariable[] = [];
  const rawEffects = await figma.getLocalEffectStylesAsync();
  for (const { name, description, effects } of rawEffects) {
    parsedEffects.push({
      name: name,
      description: description,
      type: 'effects',
      value: {
        effects: effects.map((eff) => ({
          type: eff.type,
          color: (eff as DropShadowEffect).color,
          offset: (eff as DropShadowEffect).offset,
          radius: eff.radius,
          spread: (eff as DropShadowEffect).spread || 0,
        })),
      },
    });
  }
  return {
    name: 'effects',
    modes: [
      {
        id: '',
        name: 'local-effect-styles',
        variables: parsedEffects,
      },
    ],
  };
}

export async function exportToJSON({ filetype, version }: fileMetadata) {
  const variables = await decodeVariableCollections();
  const typographies = await decodeTypographyStyles();
  const effects = await decodeEffectStyles();

  const parsedCollections: CollectionType[] = [...variables, typographies, effects];

  figma.ui.postMessage({
    type: 'VARIABLES_CODE',
    variables: {
      id: `${filetype}-file`,
      version,
      generatedAt: new Date().toISOString(),
      collections: parsedCollections,
    },
  });
}
