export interface ReportSectionFormData {
  id?: string;
  name: string;
  reportId: string;
  parentId: string | null;
  orderIndex: number | "";
}

export interface ReportSectionTableData extends ReportSectionFormData {
  id: string;
}
