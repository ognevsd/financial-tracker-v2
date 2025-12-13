export type ToastType = "standard" | "error" | "success";

export interface ToastData {
  show: boolean;
  message: string;
  type: ToastType;
}

export const defaultToastData: ToastData = {
  show: false,
  message: "",
  type: "standard",
};
