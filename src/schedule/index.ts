const schedule = require("node-schedule");
import { client } from "../db";
import { spms, funnelCharts } from "../models";

/** 每天 00:01:00 执行自动化任务 */
const job = schedule.scheduleJob("1 0 * * *", function () {
  function paddingZero(num: number) {
    if (num > 9) {
      return String(num);
    } else {
      return `0${num}`;
    }
  }

  client.connect().then(async () => {
    const current = new Date();
    /** 时间设置为前一天 */
    current.setDate(current.getDate() - 1);

    current.setHours(0, 1, 1);
    const startTime = Math.floor(current.valueOf() / 1000);

    current.setHours(23, 59, 59);
    const endTime = Math.floor(current.valueOf() / 1000);

    const year = current.getFullYear();
    const month = paddingZero(current.getMonth() + 1);
    const date = paddingZero(current.getDate());

    const formatDate = `${year}-${month}-${date}`;

    const project = {
      _id: 0,
      spm: "$_id",
      type: "$type",
      total: "$count",
      date: formatDate,
    };

    function getGroup(_id: Record<string, string>) {
      return {
        _id,
        type: { $first: "$type" },
        count: { $sum: 1 },
      };
    }

    interface Result {
      spm: string;
      type: "click" | "exposure";
      total: number;
      date: string;
    }

    // 聚合 a 的数据
    const aResult = await spms
      .aggregate<Result>([
        {
          $match: {
            time: { $gte: startTime, $lte: endTime },
            type: "click",
          },
        },
        {
          $group: getGroup({
            a: "$spm.a",
          }),
        },
        { $project: project },
      ])
      .toArray();
    console.log("aResult", aResult);

    // 聚合 a.b 的数据
    const bResult = await spms
      .aggregate<Result>([
        {
          $match: {
            time: { $gte: startTime, $lte: endTime },
            type: "click",
          },
        },
        {
          $group: getGroup({
            a: "$spm.a",
            b: "$spm.b",
          }),
        },
        { $project: project },
      ])
      .toArray();
    console.log("bResult", bResult);

    // 聚合 a.b.c 的数据
    const cResult = await spms
      .aggregate<Result>([
        {
          $match: {
            time: { $gte: startTime, $lte: endTime },
            type: "click",
          },
        },
        {
          $group: getGroup({
            a: "$spm.a",
            b: "$spm.b",
            c: "$spm.c",
          }),
        },
        { $project: project },
      ])
      .toArray();
    console.log("cResult", cResult);

    // 聚合 a.b.c.d 的数据
    const dResult = await spms
      .aggregate<Result>([
        {
          $match: {
            time: { $gte: startTime, $lte: endTime },
            type: "click",
          },
        },
        {
          $group: getGroup({
            a: "$spm.a",
            b: "$spm.b",
            c: "$spm.c",
            d: "$spm.d",
          }),
        },
        { $project: project },
      ])
      .toArray();

    console.log("dResult", dResult);

    await funnelCharts.insertMany(aResult);
    await funnelCharts.insertMany(bResult);
    await funnelCharts.insertMany(cResult);
    await funnelCharts.insertMany(dResult);

    await client.close();
  });
});
