import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { hasThemeOrKitFiles, hasIconsJsonFiles } from './fileCheck';
import type { RecursicaConfigIcons, RecursicaConfigOverrides } from '../types';
const __dirname = dirname(fileURLToPath(import.meta.url));

interface RecursicaConfig {
  iconsJson: string | undefined;
  jsons: string[];
  srcPath: string;
  project: string;
  iconsConfig: RecursicaConfigIcons | undefined;
  overrides: RecursicaConfigOverrides | undefined;
}

interface RecursicaConfigContent {
  jsonsPath: string;
  project: string;
  overrides: RecursicaConfigOverrides;
  icons: RecursicaConfigIcons | undefined;
}

/**
 * Loads and validates the configuration from recursicaConfig.json
 *
 * @throws {Error} If the config file is not found or required fields are missing
 * @returns {Object} Configuration object with the following properties:
 *   - jsons: Path to the themes-tokens and ui-kit directories
 *   - srcPath: Path to the source directory
 *   - project: Project name
 */
export function loadConfig(): RecursicaConfig {
  const rootPath = getRootPath();
  const configPath = path.join(rootPath, 'recursica.json');

  if (!fs.existsSync(configPath)) {
    throw new Error('Config file not found at: ' + configPath);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as RecursicaConfigContent;

  let jsons: string[];
  let iconsJson: string | undefined;
  if (!config.jsonsPath) {
    const { hasFiles, matchingFiles } = hasThemeOrKitFiles(rootPath);
    if (hasFiles) {
      iconsJson = hasIconsJsonFiles(rootPath);
      jsons = matchingFiles;
    } else {
      throw new Error('jsonsPath is required in config file');
    }
  } else {
    const jsonsPath = path.join(rootPath, config.jsonsPath);

    const { hasFiles, matchingFiles } = hasThemeOrKitFiles(jsonsPath);
    if (hasFiles) {
      iconsJson = hasIconsJsonFiles(jsonsPath);
      jsons = matchingFiles;
    } else {
      throw new Error('jsonsPath does not contain any theme-tokens or ui-kit files');
    }
  }

  const project = config.project;
  if (!project) {
    throw new Error('project is required in config file');
  }

  return {
    srcPath: path.join(rootPath, 'src'),
    project,
    jsons,
    iconsJson,
    overrides: config.overrides,
    iconsConfig: config.icons,
  };
}

export function getRootPath() {
  // recursively search for the package.json file
  let currentDir = __dirname;
  let level = 0;
  while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    currentDir = path.join(currentDir, '..');
    level++;
    if (level > 10) {
      throw new Error('Could not find package.json');
    }
  }
  return currentDir;
}
