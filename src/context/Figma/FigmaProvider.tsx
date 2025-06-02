import { useLayoutEffect, useState } from 'react';
import { FigmaContext, MetadataContext, IconsContext, RepositoryContext } from './FigmaContext';
import { VariableJSONCollection } from '@/plugin/types';

export interface TokensProvidersProps {
  children: React.ReactNode;
}

export function FigmaProvider({ children }: TokensProvidersProps): JSX.Element {
  const [variables, setVariables] = useState<VariableJSONCollection>();
  const [metadata, setMetadata] = useState<MetadataContext>();
  const [svgIcons, setSvgIcons] = useState<IconsContext>();
  const [repository, setRepository] = useState<RepositoryContext>({
    platform: 'gitlab',
    accessToken: '',
  });

  useLayoutEffect(() => {
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
      if (pluginMessage?.type === 'GET_ACCESS_TOKEN') {
        setRepository({
          platform: pluginMessage.platform,
          accessToken: pluginMessage.accessToken,
        });
      }
    };
    return () => {
      window.onmessage = null;
    };
  }, []);

  const updateAccessToken = (platform: 'gitlab' | 'github', accessToken: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_ACCESS_TOKEN',
          platform: 'gitlab',
          accessToken: accessToken,
        },
        pluginId: '*',
      },
      '*'
    );
    setRepository({
      platform,
      accessToken,
    });
  };

  const values = {
    svgIcons,
    variables,
    metadata,
    repository: {
      platform: repository.platform,
      accessToken: repository.accessToken,
      updateAccessToken,
    },
  };

  return <FigmaContext.Provider value={values}>{children}</FigmaContext.Provider>;
}
