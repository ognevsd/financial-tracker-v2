import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ReportSectionTableData } from "../types/reportSection";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GLYPH = {
  pipe: "\u2502", // │
  dash: "\u2500", // ─
  tee: "\u251C", // ├
  elbow: "\u2514", // └
};

export interface Hierarchy extends ReportSectionTableData {
  children: Hierarchy[];
}

export const buildSectionHierarchy = (
  items: ReportSectionTableData[],
): Hierarchy[] => {
  const itemMap: Record<string, Hierarchy> = {};
  const roots: Hierarchy[] = [];

  items.forEach((item) => {
    itemMap[item.id] = { ...item, children: [] };
  });

  items.forEach((item) => {
    if (item.parentId === "" || item.parentId === null) {
      roots.push(itemMap[item.id]);
    } else if (itemMap[item.parentId]) {
      itemMap[item.parentId].children.push(itemMap[item.id]);
    }
  });

  return roots;
};
