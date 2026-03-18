export interface TemplateField {
  templateFieldId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  displayOrder: number;
}

export interface TestCaseTemplate {
  testCaseTemplateId: string;
  projectId: string;
  name: string;
  description: string;
  isDefault: boolean;
  fields: TemplateField[];
  createdAt: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  fields?: FieldInput[];
}

export interface FieldInput {
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  isRequired?: boolean;
}
