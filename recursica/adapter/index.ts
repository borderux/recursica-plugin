import path from 'path';
import fs from 'fs';
import type { Themes, ThemeTokens, RecursicaConfigOverrides, RecursicaConfigIcons } from '../types';
import { generateVanillaExtractThemes } from './generateVanillaExtractThemes';
import { generateRecursicaTokens } from './generateRecursicaTokens';
import { generateUiKit } from './generateUiKit';
import { generateMantineTheme } from './generateMantineTheme';
import { createRecursicaObject } from './generateRecursicaObject';
import { generateColorsType } from './generateColorTypes';
import { generateIcons } from './generateIcons';

interface GenerateThemeFileParams {
  overrides: RecursicaConfigOverrides | undefined;
  srcPath: string;
  tokens: ThemeTokens;
  themes: Themes;
  project: string;
  uiKit: ThemeTokens;
  colors: string[];
  icons: Record<string, string>;
  breakpoints: Record<string, string>;
  iconsConfig: RecursicaConfigIcons | undefined;
}

/**
 * Generates Mantine theme files including:
 * - Generic theme file with base theme and createColorToken function
 * - Individual theme files for each theme variant
 * - CSS variables file
 * - Type declarations for theme colors
 * - Index file exporting all themes
 *
 * @param srcPath - Path to the source directory for type declarations
 * @param tokens - Base theme tokens
 * @param themes - Theme variants
 * @param project - Project name
 */
export function runAdapter({
  overrides,
  srcPath,
  tokens,
  themes,
  project,
  uiKit,
  colors,
  icons,
  breakpoints,
  iconsConfig,
}: GenerateThemeFileParams) {
  const outputPath = path.join(srcPath, 'recursica');

  // Ensure directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const recursicaTokensFilename = generateRecursicaTokens(tokens, { outputPath, project });

  const { themesFilename, themeContractFilename, contractTokens } = generateVanillaExtractThemes(
    tokens,
    themes,
    recursicaTokensFilename,
    { outputPath, project }
  );

  const mantineThemeFilename = generateMantineTheme({
    mantineThemeOverride: overrides?.mantineTheme,
    tokens,
    breakpoints,
    contractTokens: {
      tokens: contractTokens,
      filename: themeContractFilename,
    },
    exportingProps: {
      outputPath,
      project,
      rootPath: path.join(srcPath, '..'),
    },
  });

  const uiKitFilename = generateUiKit(
    uiKit,
    { recursicaTokensFilename, themeContractFilename },
    { outputPath, project }
  );

  const recursicaObject = createRecursicaObject(project, outputPath);

  const colorsType = generateColorsType(colors, outputPath);

  let iconsPath: string;
  if (icons) {
    iconsPath = generateIcons(icons, srcPath, iconsConfig);
  }

  console.warn(
    `Theme files generated:
    Tokens: ${recursicaTokensFilename}
    Themes: ${themesFilename}
    Contract: ${themeContractFilename}
    UI Kit: ${uiKitFilename}
    Mantine Theme: ${mantineThemeFilename}
    Recursica: ${recursicaObject}
    Colors Type: ${colorsType}
    Icons: ${iconsPath}`
  );
}
