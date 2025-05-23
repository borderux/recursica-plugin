import { useEffect, useState } from 'react';
import { TokensContext, FigmaContext, MetadataContext } from './FigmaContext';
import { ExportedVariable, VariableJSONCollection } from '@/plugin/types';

export interface TokensProvidersProps {
  children: React.ReactNode;
}

function castJson(json: VariableJSONCollection) {
  const collections = json.collections;

  const exportedVariables: {
    [key: string]: ExportedVariable[];
  } = {
    STRING: [],
    BOOLEAN: [],
    COLOR: [],
    FLOAT: [],
    TYPOGRAPHY: [],
    EFFECTS: [],
  };
  for (const { modes, name: collectionName } of collections) {
    for (const { variables } of modes) {
      for (const { name, type, value } of variables) {
        exportedVariables[type.toUpperCase()].push({
          collection: collectionName,
          name,
          isAlias: typeof value === 'object',
          value,
        });
      }
    }
  }

  return exportedVariables;
}

export function FigmaProvider({ children }: TokensProvidersProps): JSX.Element {
  const [tokens, setTokens] = useState<TokensContext>({
    codeTokens: undefined,
    accordionTokens: undefined,
  });
  const [metadata, setMetadata] = useState<MetadataContext>({
    filename: '',
    version: '',
  });

  useEffect(() => {
    window.onmessage = ({ data: { pluginMessage } }) => {
      if (pluginMessage.type === 'VARIABLES_CODE') {
        const jsonTokens = pluginMessage.variables;
        const accordionTokens = castJson(jsonTokens);

        setTokens((prevTokens) => ({
          ...prevTokens,
          accordionTokens,
          codeTokens: jsonTokens,
        }));
      }
      if (pluginMessage.type === 'METADATA') {
        setMetadata({
          filename: pluginMessage.metadata.filename,
          version: pluginMessage.metadata.version,
        });
      }
    };
    return () => {
      window.onmessage = null;
    };
  }, []);

  const values = {
    tokens,
    metadata,
  };

  return <FigmaContext.Provider value={values}>{children}</FigmaContext.Provider>;
}
