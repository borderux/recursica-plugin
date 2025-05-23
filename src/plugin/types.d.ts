export type VariableCastedValue = string | boolean | number;
export interface VariableReferenceValue {
  collection: string;
  name: string;
}

export interface TypographyValue {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontWeightAlias: string;
}

export interface EffectValue {
  effects: {
    type: string;
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    offset: {
      x: number;
      y: number;
    };
    radius: number;
    spread: number;
  }[];
}

export interface CollectionVariable {
  name: string;
  type: string;
  description: string;
  value: VariableCastedValue | VariableReferenceValue | TypographyValue | EffectValue;
}

export interface CollectionMode {
  id: string;
  name: string;
  variables: CollectionVariable[];
}

export interface CollectionType {
  name: string;
  modes: CollectionMode[];
}

export type ExportedVariableValue =
  | string
  | boolean
  | number
  | VariableReferenceValue
  | TypographyValue
  | EffectValue;

export type ExportedVariable = {
  collection: string;
  name: string;
  isAlias: boolean;
  value: ExportedVariableValue;
};

export type VariableJSONCollection = {
  id: string;
  version: string;
  generatedAt: string;
  collections: CollectionType[];
};
