import type { ThemeTokens, ExportingProps } from '../types';
import { autoGeneratedFile } from '../utils/autoGeneratedFile';
import path from 'path';
import fs from 'fs';

export function generateRecursicaTokens(
  baseTokens: ThemeTokens,
  { outputPath, project }: ExportingProps
): string {
  const recursicaTokensFilename = `Recursica${project}Tokens.ts`;
  const recursicaTokensPath = path.join(outputPath, recursicaTokensFilename);
  const recursicaTokensContent = `${autoGeneratedFile()}
export const Recursica${project}Tokens = {
  ${Object.entries(baseTokens)
    .filter(([_, value]) => typeof value === 'string')
    .map(([key, value]) => `"${key}": "${value as string}"`)
    .join(',\n  ')}
};
`;
  fs.writeFileSync(recursicaTokensPath, recursicaTokensContent);
  return recursicaTokensFilename;
}
