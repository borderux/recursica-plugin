import { exportToJSON } from './exportToJSON';
import packageInfo from '../../package.json' with { type: 'json' };
const version = packageInfo.version;

/**
 * Valid filenames for tokens and design system files.
 * These are used to determine if the current file is a tokens or design system file.
 * If the filename is not valid for either, the plugin will not run
 */
// Valid names for tokens file
const validThemeFilenames = ['theme', 'theme + tokens', 'tokens'];
// Valid names for design system file
const validUiKitFilenames = ['ui kit', 'ui-kit'];

const validFilenames = [...validThemeFilenames, ...validUiKitFilenames];

const filename = figma.root.name.trim();
const filetype = validThemeFilenames.some((validFilename) =>
  filename.toLowerCase().includes(validFilename)
)
  ? 'theme+tokens'
  : 'ui-kit';

// Check if the filename is valid
if (!validFilenames.some((validFilename) => filename.toLowerCase().includes(validFilename))) {
  figma.notify('Plugin will not run because the file is not named correctly.');
  figma.closePlugin();
}

figma.showUI(__html__, {
  width: 550,
  height: 650,
  themeColors: true,
});

figma.ui.postMessage({
  type: 'METADATA',
  metadata: {
    filename,
    version,
  },
});
// Load the local variable collections
exportToJSON({ filetype, filename, version });
