export function toFontWeight(value: string) {
  // thin -> 100
  // extra light -> 200
  // light -> 300
  // regular -> 400
  // medium -> 500
  // semibold -> 600
  // bold -> 700
  // extra bold -> 800
  // black -> 900
  // name to number reference: https://docs.tokens.studio/token-types/token-type-font-weight#numeric-weights
  switch (value.toLowerCase()) {
    case 'thin':
      return 100;
    case 'extra light':
      return 200;
    case 'light':
      return 300;
    case 'regular':
      return 400;
    case 'medium':
      return 500;
    case 'semi bold':
      return 600;
    case 'bold':
      return 700;
    case 'extra bold':
      return 800;
    case 'black':
      return 900;
    default:
      return 400;
  }
}
