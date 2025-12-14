export interface ReportSectionFormData {
  id?: string;
  name: string;
  reportId: string;
  orderIndex: number | "";
}

export interface ReportSectionTableData extends ReportSectionFormData {
  id: string;
}
