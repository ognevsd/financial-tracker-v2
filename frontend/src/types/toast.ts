import type { ToastType } from "../components/Toast";

export interface ToastData {
  show: boolean;
  message: string;
  type: ToastType;
}
