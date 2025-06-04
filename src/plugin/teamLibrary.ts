import { GenericVariables } from './exportToJSON';

import { VariableCastedValue } from './types';
import { rgbToHex } from './utils/rgbToHex';

export async function getTeamLibrary() {
  const teamLibrary = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

  const libraries: Record<string, { value: string; name: string }[]> = {};
  for (const library of teamLibrary) {
    if (!libraries[library.libraryName]) libraries[library.libraryName] = [];
    libraries[library.libraryName].push({
      value: library.key,
      name: library.name,
    });
  }

  figma.ui.postMessage({
    type: 'TEAM_LIBRARIES',
    payload: libraries,
  });

  return libraries;
}

export async function getRemoteVariables(
  projectId: string,
  projectType: string,
  version: string,
  tokenCollection: string,
  themesCollections: string[],
  uiKit: GenericVariables
) {
  const libraries = await getTeamLibrary();
  const [tokenVariables] = await decodeFileVariables(libraries[tokenCollection]);
  const themes: Record<string, GenericVariables> = {};
  for (const theme of themesCollections) {
    const [themeValues, metadata] = await decodeFileVariables(libraries[theme]);
    const filetype = Object.values(
      metadata as Record<string, { name: string; value: string }>
    ).find((m) => m.name === 'project-type')?.value;
    if (filetype !== 'themes') continue;
    const themeName = Object.values(
      metadata as Record<string, { name: string; value: string }>
    ).find((m) => m.name === 'theme')?.value;
    if (!themeValues || !themeName) continue;
    themes[themeName] = themeValues;
  }

  const response = {
    type: 'RECURSICA_VARIABLES',
    payload: {
      'project-id': projectId,
      'file-type': projectType,
      pluginVersion: version,
      tokens: tokenVariables,
      themes,
      uiKit,
    },
  };
  console.log('response', response);

  figma.ui.postMessage(response);
}

async function decodeFileVariables(
  fileCollections: { value: string; name: string }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const metadataCollection = fileCollections.find((f) => f.name === 'ID variables');
  if (!metadataCollection) {
    figma.notify('No metadata collection found');
    return [];
  }
  const metadataVariables = await decodeRemoteVariables(metadataCollection.value);

  const remainingCollections = fileCollections.filter((f) => f.name !== 'ID variables');

  const variables: GenericVariables = {};
  for (const variable of remainingCollections) {
    const variableData = await decodeRemoteVariables(variable.value);
    Object.assign(variables, variableData);
  }
  return [variables, metadataVariables];
}

export async function decodeRemoteVariables(collection: string) {
  const variables: GenericVariables = {};
  const tokenVariables = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection);
  for (const variable of tokenVariables) {
    const {
      valuesByMode,
      name: variableName,
      resolvedType,
      description,
      variableCollectionId,
    } = await figma.variables.importVariableByKeyAsync(variable.key);

    const parentVariableCollection =
      await figma.variables.getVariableCollectionByIdAsync(variableCollectionId);

    if (!parentVariableCollection) continue;
    const { modes, name: collectionName } = parentVariableCollection;

    for (const modeId in valuesByMode) {
      const mode = modes.find((md) => md.modeId === modeId);
      if (!mode) continue;

      const rawValue = valuesByMode[modeId];
      let value;
      if (typeof rawValue === 'object') {
        if ((rawValue as VariableAlias).type) {
          const referencedVariable = await figma.variables.getVariableByIdAsync(
            (rawValue as VariableAlias).id
          );
          const referencedCollection = await figma.variables.getVariableCollectionByIdAsync(
            referencedVariable!.variableCollectionId
          );
          value = {
            collection: referencedCollection!.name,
            name: referencedVariable!.name,
          };
        } else if (resolvedType === 'COLOR') {
          value = rgbToHex(rawValue as RGBA);
        }
      } else {
        value = rawValue as VariableCastedValue;
      }

      if (value !== undefined) {
        const idValue = `[${collectionName}][${mode.name}][${variableName}]`;
        const safeParsedIdValue = idValue.split(' ').join('-');
        variables[safeParsedIdValue] = {
          collection: collectionName,
          mode: mode.name,
          name: variableName,
          type: resolvedType.toLowerCase(),
          description: description,
          value,
        };
      }
    }
  }
  return variables;
}
