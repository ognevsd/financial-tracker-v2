export interface TaxonomyFormData {
  id?: string;
  name: string;
  description: string;
  reportId: string;
}

export interface TaxonomyTableData extends TaxonomyFormData {
  id: string;
  reportName: string;
}
