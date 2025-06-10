import { useLayoutEffect, useState } from 'react';
import { FigmaContext, RepositoryContext } from './FigmaContext';
import { VariableJSONCollection } from '@/plugin/types';

export interface TokensProvidersProps {
  children: React.ReactNode;
}

export function FigmaProvider({ children }: TokensProvidersProps): JSX.Element {
  const [repository, setRepository] = useState<RepositoryContext>({
    platform: 'gitlab',
    accessToken: '',
  });
  const [availableLibraries, setAvailableLibraries] =
    useState<Record<string, { value: string; name: string }[]>>();
  const [recursicaVariables, setRecursicaVariables] = useState<VariableJSONCollection>();

  useLayoutEffect(() => {
    window.onmessage = ({ data: { pluginMessage } }) => {
      if (pluginMessage?.type === 'GET_ACCESS_TOKEN') {
        const { platform, accessToken } = pluginMessage.payload;
        setRepository({
          platform,
          accessToken,
        });
      }
      if (pluginMessage?.type === 'TEAM_LIBRARIES') {
        setAvailableLibraries(pluginMessage.payload);
      }
      if (pluginMessage?.type === 'RECURSICA_VARIABLES') {
        setRecursicaVariables(pluginMessage.payload);
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
          payload: {
            platform,
            accessToken,
          },
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

  const saveEffectsIdToVariables = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'SAVE_EFFECTS_ID_TO_VARIABLES',
        },
        pluginId: '*',
      },
      '*'
    );
  };

  const values = {
    repository: {
      platform: repository.platform,
      accessToken: repository.accessToken,
      updateAccessToken,
    },
    libraries: {
      availableLibraries,
      recursicaVariables,
    },
    saveEffectsIdToVariables,
  };

  return <FigmaContext.Provider value={values}>{children}</FigmaContext.Provider>;
}
