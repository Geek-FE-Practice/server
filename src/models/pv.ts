import { db } from "../db";

export interface IPvData {
  spm: {
    a: string;
    b: string;
  };
  preSpm: {
    a: string;
    b: string;
  } | null;
  time: number;
}

export const pvdatas = db.collection<IPvData>("pvdatas");
