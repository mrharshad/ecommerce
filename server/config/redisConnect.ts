import { createClient } from "redis";
import config from "./config";
const { redisHost, redisPassword, redisPort } = config;
const client = createClient({
  password: redisPassword,
  socket: {
    host: redisHost,
    port: redisPort,
  },
  // socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
});

// client.on("error", (err: Error) => console.log("err", err));

(async () => {
  if (!client.isOpen) {
    await client.connect();
  }
})();

export default client;

//                  Product redis keys

// 1 `random:product`

// 2 `searchKey:${key}` // kisi tarah ka product search karne par

// 3 `${identity}:${key}` // identity me tOfP ya category hoga aur key me kya hai value hoga

//  4 `single:${_id}` // single product ka data hoga

//              redis User Urls

// 1 `email:${email}`  // invalid email aur token verification ke time

// 2  `user:${_id}` // user ka data authantication vala data
