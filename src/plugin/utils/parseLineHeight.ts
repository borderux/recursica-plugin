export function parseLineHeight(lineHeight: LineHeight) {
  if (lineHeight.unit === 'AUTO') {
    return {
      unit: 'AUTO',
    };
  }
  if (lineHeight.unit === 'PERCENT') {
    const value = lineHeight.value;
    const decimal = value % 1;
    const roundedValue = decimal > 0.9 ? Math.ceil(value) : value;
    return {
      unit: 'PERCENT',
      value: roundedValue,
    };
  }
  return {
    unit: lineHeight.unit,
    value: lineHeight.value,
  };
}
