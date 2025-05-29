import { useEffect, useState } from 'react';
import { FigmaContext, MetadataContext, IconsContext } from './FigmaContext';
import { VariableJSONCollection } from '@/plugin/types';

export interface TokensProvidersProps {
  children: React.ReactNode;
}

export function FigmaProvider({ children }: TokensProvidersProps): JSX.Element {
  const [variables, setVariables] = useState<VariableJSONCollection>();
  const [metadata, setMetadata] = useState<MetadataContext>();
  const [svgIcons, setSvgIcons] = useState<IconsContext>();

  useEffect(() => {
    window.onmessage = ({ data: { pluginMessage } }) => {
      if (pluginMessage?.type === 'VARIABLES_CODE') {
        setVariables(pluginMessage.json);
      }
      if (pluginMessage?.type === 'METADATA') {
        setMetadata({
          projectId: pluginMessage.metadata.projectId,
          theme: pluginMessage.metadata.theme,
          projectType: pluginMessage.metadata.projectType,
          pluginVersion: pluginMessage.metadata.pluginVersion,
        });
      }
      if (pluginMessage?.type === 'EXPORT_SVG_ICONS') setSvgIcons(pluginMessage.svgIcons);
    };
    return () => {
      window.onmessage = null;
    };
  }, []);

  const values = {
    svgIcons,
    variables,
    metadata,
  };

  return <FigmaContext.Provider value={values}>{children}</FigmaContext.Provider>;
}
