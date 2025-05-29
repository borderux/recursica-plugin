import fs from 'fs';
import type {
  JsonContent,
  JsonContentIcons,
  Token,
  Themes,
  ThemeTokens,
  RecursicaConfigOverrides,
} from './types';
import { isFontFamilyToken, isEffectToken, isColorOrFloatToken } from './utils/helpers';
import { loadConfig } from './utils/loadConfig';
import { runAdapter } from './adapter';
import { capitalize } from './utils/capitalize';

const tokens: ThemeTokens = {};

const breakpoints: Record<string, string> = {};

const colorTokens: string[] = [];

const icons: Record<string, string> = {};

const themes: Themes = {};

const uiKit: ThemeTokens = {};

function processTokenValue(token: Token, modeName: string, jsonThemeName: string) {
  const processValue = (target: Record<string, number | string | Token | ThemeTokens>) => {
    if (typeof token.value === 'string') {
      target[token.name] = token.value;
      return true;
    }
    if (typeof token.value === 'number') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      target[token.name] = `${token.value}px`;
      return true;
    }
    if (typeof token.value === 'object') {
      target[token.name] = token.value as Token;
      return true;
    }
    return false;
  };

  if (token.collection === 'Breakpoints') {
    processValue(breakpoints);
    // Add breakpoints to uiKit with 'breakpoints/' prefix
    const uiKitTarget: Record<string, number | string | Token | ThemeTokens> = {};
    processValue(uiKitTarget);
    Object.entries(uiKitTarget).forEach(([key, value]) => {
      // Ensure we only store string values
      if (typeof value === 'string') {
        uiKit[`breakpoint/${key}`] = value;
      } else if (typeof value === 'number') {
        uiKit[`breakpoint/${key}`] = `${value.toString()}px`;
      }
    });
  } else if (token.collection === 'UI Kit') {
    processValue(uiKit);
  } else if (token.collection === 'Tokens') {
    processValue(tokens);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!themes[jsonThemeName]) themes[jsonThemeName] = {};
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!themes[jsonThemeName][modeName]) themes[jsonThemeName][modeName] = {};
    processValue(themes[jsonThemeName][modeName]);
  }
}

interface ProcessTokensParams {
  jsonPath: string;
  tokens: ThemeTokens;
  themes: Themes;
  project: string;
  overrides: RecursicaConfigOverrides | undefined;
}

function processTokens({ jsonPath, tokens, themes, project, overrides }: ProcessTokensParams) {
  const jsonContent: JsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as JsonContent;

  const jsonProjectId = jsonContent['project-id'];
  const jsonThemeName = jsonContent['theme-name'];
  if (!jsonProjectId) {
    throw new Error('project-id is required in the json file');
  }
  if (jsonProjectId.toLowerCase() !== project.toLowerCase()) {
    throw new Error('project-id does not match the project in the config file');
  }

  // Process tokens collection
  for (const token of Object.values(jsonContent.variables)) {
    if (isFontFamilyToken(token)) {
      if (!tokens[jsonThemeName]) tokens[jsonThemeName] = {} as Record<string, string>;
      if (typeof tokens[jsonThemeName] !== 'object')
        tokens[jsonThemeName] = {} as Record<string, string>;

      tokens[jsonThemeName][`typography/${token.variableName}`] =
        overrides?.fontFamily?.[token.fontFamily] ?? token.fontFamily;
      tokens[jsonThemeName][`typography/${token.variableName}-size`] =
        `${token.fontSize.toString()}px`;
      // check if overrides.fontWeight is defined
      if (overrides?.fontWeight) {
        const weight = overrides.fontWeight.find(
          (weight) =>
            weight.alias === token.fontWeight.alias && weight.fontFamily === token.fontFamily
        );
        // check if there's a weight that matches the alias and fontFamily
        // if there is, use the value from the overrides
        // if there isn't, use the value from the token
        if (weight) {
          tokens[jsonThemeName][`typography/${token.variableName}-weight`] =
            weight.value.toString();
        } else {
          tokens[jsonThemeName][`typography/${token.variableName}-weight`] =
            token.fontWeight.value.toString();
        }
      } else {
        tokens[jsonThemeName][`typography/${token.variableName}-weight`] =
          token.fontWeight.value.toString();
      }
      if (token.lineHeight.unit === 'PERCENT') {
        tokens[jsonThemeName][`typography/${token.variableName}-line-height`] =
          `${token.lineHeight.value.toString()}%`;
      } else {
        tokens[jsonThemeName][`typography/${token.variableName}-line-height`] = '1.2';
      }
      tokens[jsonThemeName][`typography/${token.variableName}-letter-spacing`] =
        token.letterSpacing.unit === 'PIXELS'
          ? `${token.letterSpacing.value.toString()}px`
          : `${token.letterSpacing.value.toString()}%`;
      tokens[jsonThemeName][`typography/${token.variableName}-text-case`] = token.textCase;
      tokens[jsonThemeName][`typography/${token.variableName}-text-decoration`] =
        token.textDecoration;
      continue;
    }
    if (isEffectToken(token)) {
      const effectValue: string[] = [];
      token.effects.forEach((effect) => {
        const {
          color: { r, g, b, a },
          offset: { x, y },
          radius,
          spread,
        } = effect;
        effectValue.push(
          `${x.toString()}px ${y.toString()}px ${radius.toString()}px ${spread.toString()}px rgba(${r.toString()}, ${g.toString()}, ${b.toString()}, ${a.toString()})`
        );
      });
      tokens[`effect/${token.variableName}`] = effectValue.join(', ');
      continue;
    }
    if (isColorOrFloatToken(token)) {
      const modeName = capitalize(token.mode)
        .replace(/[()/]/g, '-')
        .replace(/\s/g, '')
        .replace(/-$/, '');

      if (modeName !== 'mode1') themes[modeName] = {};
      if (token.type === 'color' && !colorTokens.includes(token.name)) {
        colorTokens.push(token.name);
      }
      processTokenValue(token, modeName, jsonThemeName);
    } else {
      console.warn(`${JSON.stringify(token, null, 2)} could not be processed`);
    }
  }
}

// Run the script
try {
  const { jsons, srcPath, project, iconsJson, overrides, iconsConfig } = loadConfig();

  if (iconsJson) {
    const iconsJsonContent: JsonContentIcons = JSON.parse(
      fs.readFileSync(iconsJson, 'utf-8')
    ) as JsonContentIcons;
    for (const [iconName, iconPath] of Object.entries(iconsJsonContent)) {
      icons[iconName] = iconPath;
    }
  }

  // Read and parse JSON files
  for (const jsonPath of jsons) {
    processTokens({ jsonPath, tokens, themes, project, overrides });
  }

  runAdapter({
    overrides,
    srcPath,
    tokens,
    icons,
    colors: colorTokens,
    breakpoints,
    themes,
    uiKit,
    project,
    iconsConfig,
  });
} catch (error) {
  console.error('Error generating theme:', error);
  process.exit(1);
}
