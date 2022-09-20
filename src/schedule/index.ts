// const schedule = require("node-schedule");
import { client } from "../db";
import { spms, funnelCharts } from "../models";

// const job = schedule.scheduleJob("42 * * * *", function () {
//   console.log("The answer to life, the universe, and everything!");
// });
client.connect().then(async () => {
  const current = new Date();
  current.setHours(0, 1, 1);
  const startTime = Math.floor(current.valueOf() / 1000);

  current.setHours(23, 59, 59);
  const endTime = Math.floor(current.valueOf() / 1000);

  const year = current.getFullYear();
  const month = current.getMonth();
  const date = current.getDate();

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

  // 聚合曝光数据
  const result = await spms
    .aggregate<Result>([
      {
        $match: {
          time: { $gte: startTime, $lte: endTime },
          type: "exposure",
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
  console.log("result", result);

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

  await funnelCharts.insertMany(result);
  await funnelCharts.insertMany(aResult);
  await funnelCharts.insertMany(bResult);
  await funnelCharts.insertMany(cResult);
  await funnelCharts.insertMany(dResult);

  await client.close();
});
