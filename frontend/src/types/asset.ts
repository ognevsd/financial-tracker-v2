export interface AssetFormData {
  id?: string;
  ticker: string;
  name: string;
  assetTypeId: string;
  industry: string;
  commodity: string;
  currencyId: string;
  reportingMultiplicator: number | "";
}

export interface AssetTableData extends AssetFormData {
  id: string;
}
