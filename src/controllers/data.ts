import type { ParameterizedContext } from "koa";

import { spms } from "@models/spm";
import { pvdatas } from "@models/pv";

class DataController {
  /** 保存 spm 数据 */
  saveSpm = async (ctx: ParameterizedContext) => {
    const body = ctx.request.body as {
      data: {
        type: "click" | "exposure";
        spm: string;
        preSpm?: string;
        time: number;
      }[];
    };

    const insetData = body.data.map((element) => {
      const spm = {
        a: "",
        b: "",
        c: "",
        d: "",
      };

      let preSpm: typeof spm | null = null;

      if (element.spm) {
        const tmpArr = element.spm.split(".");
        spm.a = tmpArr[0];
        spm.b = tmpArr[1];
        spm.c = tmpArr[2];
        spm.d = tmpArr[3];
      }

      if (element.preSpm) {
        const tmpArr = element.spm.split(".");
        preSpm = {
          a: tmpArr[0],
          b: tmpArr[1],
          c: tmpArr[2],
          d: tmpArr[3],
        };
      }

      return {
        type: element.type,
        time: element.time,
        spm,
        preSpm,
      };
    });
    try {
      await spms.insertMany(insetData);
      ctx.status = 204;
    } catch (error) {
      ctx.status = 500;
    }
  };

  savePv = async (ctx: ParameterizedContext) => {
    const body = ctx.request.body as {
      spm: string;
      preSpm: string | null;
    };

    const spm = {
      a: "",
      b: "",
    };

    let preSpm: typeof spm | null = null;

    if (body.spm) {
      const tmpArr = body.spm.split(".");
      spm.a = tmpArr[0];
      spm.b = tmpArr[1];
    }

    if (body.preSpm) {
      const tmpArr = body.preSpm.split(".");

      preSpm = {
        a: tmpArr[0],
        b: tmpArr[1],
      };
    }

    try {
      await pvdatas.insertOne({
        spm,
        preSpm,
        time: Math.floor(Date.now() / 1000),
      });
      ctx.status = 204;
    } catch (error) {
      ctx.status = 500;
    }
  };
}

export default new DataController();
