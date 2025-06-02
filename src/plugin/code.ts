import { exportToJSON } from './exportToJSON';
import packageInfo from '../../package.json' with { type: 'json' };
import { exportIcons } from './exportIcons';
import { decodeProjectMetadataCollection } from './projectMetadataCollection';
const version = packageInfo.version;

async function main() {
  figma.showUI(`<script>window.location.href ="http://localhost:5173"</script>`, {
    width: 350,
    height: 400,
    themeColors: true,
  });

  const { projectId, projectType, theme } = await decodeProjectMetadataCollection();

  figma.ui.postMessage({
    type: 'METADATA',
    metadata: {
      projectId,
      projectType,
      theme,
      pluginVersion: version,
    },
  });
  // Load the local variable collections
  exportToJSON({ projectId, projectType, version, theme });
  exportIcons();

  const accessToken = await figma.clientStorage.getAsync('accessToken');
  const { platform, accessToken: accessTokenValue } = JSON.parse(accessToken || '{}');

  figma.ui.postMessage({
    type: 'GET_ACCESS_TOKEN',
    platform,
    accessToken: accessTokenValue,
  });

  figma.ui.onmessage = async (e) => {
    if (e.type === 'UPDATE_ACCESS_TOKEN') {
      await figma.clientStorage.setAsync(
        'accessToken',
        JSON.stringify({ platform: e.platform, accessToken: e.accessToken })
      );
      figma.notify('Access token updated');
    }
  };
}

main();
