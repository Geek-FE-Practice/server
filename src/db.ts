import mongoose from "mongoose";

export default class DB {
  connectDB(cb: () => void): void {
    const connectionString = process.env.CONNECTION_STRING as string;

    mongoose.connect(connectionString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    });

    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
      cb()
    });
  }
}
