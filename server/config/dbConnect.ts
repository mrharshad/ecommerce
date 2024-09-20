import { connect, connection } from "mongoose";
import config from "./config";
const { mongodbUrl, isDevelopment } = config;
function dbConnect() {
  connect(mongodbUrl)
    .then((): void => {})
    .catch((err) => {});
}

export default dbConnect;
