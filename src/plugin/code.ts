import { exportToJSON } from './exportToJSON';
import packageInfo from '../../package.json' with { type: 'json' };
import { exportIcons } from './exportIcons';
import { decodeProjectMetadataCollection } from './projectMetadataCollection';
import { getAccessTokens, updateAccessTokens } from './accessTokens';
import { getRemoteVariables, getTeamLibrary } from './teamLibrary';
const version = packageInfo.version;

async function main() {
  figma.showUI(`<script>window.location.href ="http://localhost:5173"</script>`, {
    width: 450,
    height: 600,
    themeColors: true,
  });

  const { projectId, projectType, theme } = await decodeProjectMetadataCollection(version);
  // Load the local variable collections
  const localVariables = await exportToJSON({ projectId, projectType, version, theme });
  await exportIcons();
  getAccessTokens();
  getTeamLibrary();

  figma.ui.onmessage = async (e) => {
    if (e.type === 'UPDATE_ACCESS_TOKEN') {
      const { platform, accessToken } = e.payload;
      await updateAccessTokens(platform, accessToken);
    }
    if (e.type === 'FETCH_SOURCES') {
      const { tokenCollection, themesCollections } = e.payload;
      await getRemoteVariables(
        projectId,
        projectType,
        version,
        tokenCollection,
        themesCollections,
        localVariables
      );
    }
  };
}

main();
