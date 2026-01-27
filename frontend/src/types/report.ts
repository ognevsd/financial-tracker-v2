export type EditValue = number | "";

export type Year = number;

export type FlatReport = Record<string, Record<Year, number>>;

export interface Field {
  id: string;
  name: string;
  values: Record<Year, number>;
}

export interface Section {
  id: string;
  name: string;
  sections: Section[];
  fields: Field[];
}

export interface Report {
  years: Year[];
  sections: Section[];
}

export interface ReportFormData {
  id?: string;
  name: string;
}

export interface ReportTableData extends ReportFormData {
  id: string;
}
