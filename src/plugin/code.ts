import { exportToJSON } from './exportToJSON';
import packageInfo from '../../package.json' with { type: 'json' };
import { exportIcons, exportSelectedIcons } from './exportIcons';
import { decodeProjectMetadataCollection } from './projectMetadataCollection';
const version = packageInfo.version;

async function main() {
  const { projectId, projectType, theme } = await decodeProjectMetadataCollection();

  figma.showUI(__html__, {
    width: 350,
    height: 200,
    themeColors: true,
  });

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
  figma.on('selectionchange', () => {
    exportSelectedIcons([...figma.currentPage.selection]);
  });
}

main();
