const env = process.env;
const isDevelopment: boolean = env.NODE_ENV === "development";

const _config = {
  isDevelopment,
  jwtSecretCode: env.JWT_SECRET_CODE as string,

  // data base
  mongodbUrl: env.MongoDB_URL as string,
  // cloudinary
  cloudinaryName: env.CLOUDINARY_NAME,
  cloudinaryApi: env.CLOUDINARY_API,
  cloudinarySecret: env.CLOUDINARY_SECRET,

  // redis
  redisHost: env.REDIS_HOST as string,
  redisPassword: env.REDIS_PASSWORD as string,
  redisPort: Number(env.REDIS_PORT),
};

// simple mail transfer protocol
const orderSmtp = {
  service: env.ORDER_SERVICE as string,
  password: env.ORDER_PASSWORD as string,
  host: env.ORDER_HOST as string,
  port: Number(env.ORDER_PORT),
};

export default Object.freeze(_config);

export { orderSmtp };
