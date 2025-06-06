import fs from 'fs';
import path from 'path';
import { autoGeneratedFile } from '../utils/autoGeneratedFile';

export function generateColorsType(colorTokens: string[], outputPath: string) {
  const colorsType = `${autoGeneratedFile()}
export type RecursicaColors = \n\t"${colorTokens.join('" |\n\t"')}";\n`;
  fs.writeFileSync(path.join(outputPath, 'RecursicaColorsType.ts'), colorsType);

  return 'RecursicaColorsType.ts';
}
