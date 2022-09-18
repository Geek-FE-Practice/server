import { db } from "../db";

export interface IData {
  type: "click" | "exposure";
  spm: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  preSpm: {
    a: string;
    b: string;
    c: string;
    d: string;
  } | null;
  time: number;
}

export const spms = db.collection<IData>("spms");
