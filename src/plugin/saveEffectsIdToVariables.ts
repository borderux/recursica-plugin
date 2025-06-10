export async function saveEffectsIdToVariables() {
  const effects = await figma.getLocalEffectStylesAsync();
  const effectsKeys = effects.map((effect) => effect.key);
  const typographies = await figma.getLocalTextStylesAsync();
  const typographiesKeys = typographies.map((typography) => typography.key);
  const styleVariables = [...effectsKeys, ...typographiesKeys];

  const variableCollections = await figma.variables.getLocalVariableCollectionsAsync();
  let styleVariablesCollection = variableCollections.find(
    (collection) => collection.name === 'style-variables-keys'
  );

  if (!styleVariablesCollection) {
    const newStyleVariablesCollection =
      figma.variables.createVariableCollection('style-variables-keys');
    styleVariablesCollection = newStyleVariablesCollection;
  }
  for (const styleVariable of styleVariables) {
    try {
      const variable = figma.variables.createVariable(
        styleVariable,
        styleVariablesCollection,
        'STRING'
      );
      variable.setValueForMode(styleVariablesCollection.defaultModeId, styleVariable);
    } catch (error) {
      console.log('error', error);
      continue;
    }
  }
}
