import { connect, connection } from "mongoose";
import config from "./config";
const { mongodbUrl, isDevelopment } = config;
function dbConnect() {
  connect(mongodbUrl)
    .then((): void => {
      if (isDevelopment)
        console.log(`server is connected port: ${connection.host}`);
    })
    .catch((err) => {
      if (isDevelopment)
        console.log(`server is not connected for data base: ${err.message}`);
    });
}

export default dbConnect;
