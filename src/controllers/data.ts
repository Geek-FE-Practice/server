import type { ParameterizedContext } from "koa";

import { spms, pvdatas, funnelCharts } from "@models/index";

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

  async getFunnelChartData(ctx: ParameterizedContext) {
    const query = ctx.request.query as {
      date: string;
    };

    const data = await funnelCharts
      .aggregate([
        {
          $match: {
            type: "click",
            date: query.date,
            "spm.a": {
              $exists: true,
            },
            "spm.b": {
              $exists: true,
            },
            "spm.c": {
              $exists: true,
            },
            "spm.d": {
              $exists: true,
            },
          },
        },
        {
          $lookup: {
            from: "funnelChart",
            let: {
              a: "$spm.a",
            },
            as: "level1",
            pipeline: [
              {
                $match: {
                  "spm.a": {
                    $exists: true,
                  },
                  "spm.b": {
                    $exists: false,
                  },
                  "spm.c": {
                    $exists: false,
                  },
                  "spm.d": {
                    $exists: false,
                  },
                  $expr: {
                    $and: [
                      {
                        $eq: ["$spm.a", "$$a"],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "funnelChart",
            let: {
              a: "$spm.a",
              b: "$spm.b",
            },
            as: "level2",
            pipeline: [
              {
                $match: {
                  "spm.a": {
                    $exists: true,
                  },
                  "spm.b": {
                    $exists: true,
                  },
                  "spm.c": {
                    $exists: false,
                  },
                  "spm.d": {
                    $exists: false,
                  },
                  $expr: {
                    $and: [
                      {
                        $eq: ["$spm.a", "$$a"],
                      },
                      {
                        $eq: ["$spm.b", "$$b"],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "funnelChart",
            let: {
              a: "$spm.a",
              b: "$spm.b",
              c: "$spm.c",
            },
            as: "level3",
            pipeline: [
              {
                $match: {
                  "spm.a": {
                    $exists: true,
                  },
                  "spm.b": {
                    $exists: true,
                  },
                  "spm.c": {
                    $exists: true,
                  },
                  "spm.d": {
                    $exists: false,
                  },
                  $expr: {
                    $and: [
                      {
                        $eq: ["$spm.a", "$$a"],
                      },
                      {
                        $eq: ["$spm.b", "$$b"],
                      },
                      {
                        $eq: ["$spm.c", "$$c"],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      ])
      .toArray();

    const tmp = data.map((element) => {
      return {
        spm: element.spm,
        date: element.date,
        funnelChart: [
          { label: `${element.spm.d}点位点击`, count: element.total },
          { label: `${element.spm.c}区块曝光`, count: element.level3[0].total },
          { label: `${element.spm.b}页面访问`, count: element.level2[0].total },
          { label: `${element.spm.a}站点访问`, count: element.level1[0].total },
        ],
      };
    });

    ctx.body = {
      data: tmp,
    };
  }
}

export default new DataController();
