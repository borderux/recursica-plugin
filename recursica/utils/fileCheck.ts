import fs from 'fs';
import path from 'path';

interface FileCheckResult {
  hasFiles: boolean;
  matchingFiles: string[];
}

/**
 * Checks if a given directory contains files with either theme-tokens or ui-kit suffix
 * @param directoryPath - The path to check for files
 * @returns FileCheckResult - Object containing boolean result and array of matching files with full paths
 */
export function hasThemeOrKitFiles(directoryPath: string): FileCheckResult {
  try {
    const files = fs.readdirSync(directoryPath);

    const matchingFiles = files
      .filter((file) => {
        const fileName = file.toLowerCase();
        return (
          fileName === 'recursica-tokens.json' ||
          fileName === 'recursica-ui-kit.json' ||
          fileName.includes('-theme.json')
        );
      })
      .map((file) => path.join(directoryPath, file));

    return {
      hasFiles: matchingFiles.length > 0,
      matchingFiles,
    };
  } catch (error) {
    console.error(`Error checking directory ${directoryPath}:`, error);
    return {
      hasFiles: false,
      matchingFiles: [],
    };
  }
}

export function hasIconsJsonFiles(directoryPath: string): string | undefined {
  try {
    const files = fs.readdirSync(directoryPath);

    const matchingFiles = files
      .filter((file) => {
        const fileName = file.toLowerCase();
        return fileName === 'recursica-icons.json';
      })
      .map((file) => path.join(directoryPath, file));

    return matchingFiles.length > 0 ? matchingFiles[0] : undefined;
  } catch (error) {
    console.error(`Error checking directory ${directoryPath}:`, error);
    return undefined;
  }
}
