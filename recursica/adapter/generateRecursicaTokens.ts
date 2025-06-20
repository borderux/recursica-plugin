import type { ThemeTokens, ExportingProps, ExportingResult } from '../types';
import { autoGeneratedFile } from '../utils/autoGeneratedFile';

export function generateRecursicaTokens(
  baseTokens: ThemeTokens,
  { outputPath, project }: ExportingProps
): ExportingResult {
  const recursicaTokensFilename = `Recursica${project}Tokens.ts`;
  const recursicaTokensPath = outputPath + '/' + recursicaTokensFilename;
  const recursicaTokensContent = `${autoGeneratedFile()}
export const Recursica${project}Tokens = {
  ${Object.entries(baseTokens)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => typeof value === 'string')
    .map(([key, value]) => `"${key}": "${value as string}"`)
    .join(',\n  ')}
};
`;
  return {
    content: recursicaTokensContent,
    path: recursicaTokensPath,
    filename: recursicaTokensFilename,
  };
}
