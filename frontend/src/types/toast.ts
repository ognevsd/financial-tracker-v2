export type ToastType = "standard" | "error" | "success";

export interface ToastData {
  show: boolean;
  message: string;
  type: ToastType;
}
