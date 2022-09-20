import { db } from "../db";

export interface IFunnelChart {
  type: "click" | "exposure";
  spm: {
    a?: string;
    b?: string;
    c?: string;
    d?: string;
  };
  total: number;
  date: string;
}

export const funnelCharts = db.collection<IFunnelChart>("funnelChart");
