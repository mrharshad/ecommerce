import { createClient } from "redis";
import config from "./config";
const { isDevelopment, redisHost, redisPassword, redisPort } = config;
const client = createClient({
  password: redisPassword,
  socket: {
    host: redisHost,
    port: redisPort,
  },
  // socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
});

client.on("error", (err: Error) => console.log("err", err));

(async () => {
  if (!client.isOpen) {
    await client.connect();
    if (isDevelopment) console.log("redis server is connected");
  }
})();

export default client;
