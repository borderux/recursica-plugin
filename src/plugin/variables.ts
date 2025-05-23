import { CollectionMode, CollectionType, VariableCastedValue } from './types';
import { rgbToHex } from './utils';

export async function processVariableCollection({
  name: collectionName,
  modes,
  variableIds,
}: VariableCollection) {
  const collections: CollectionType = {
    name: collectionName,
    modes: [],
  };

  const collectionModes: CollectionMode[] = [];

  modes.forEach((mode) => {
    const modeJson = {
      id: mode.modeId,
      name: mode.name,
      variables: [],
    };
    collectionModes.push(modeJson);
  });

  for (const variableId of variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    if (!variable) continue;
    const { valuesByMode, name: variableName, resolvedType, description } = variable;

    for (const modeId in valuesByMode) {
      const mode = collectionModes.find((m) => m.id === modeId);

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
        mode!.variables.push({
          name: variableName,
          type: resolvedType.toLowerCase(),
          description: description,
          value,
        });
      }
    }
  }
  collections.modes = collectionModes;
  return collections;
}
