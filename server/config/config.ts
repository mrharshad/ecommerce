import { TCacheStatus } from "../interfaces/redis";

const env = process.env;
const isDevelopment: boolean = env.NODE_ENV === "development";
const redisUserCache: TCacheStatus = "enable";
const redisOrdersCache: TCacheStatus = "enable";
const redisProductsCache: TCacheStatus = "enable";
const redisSignUpCache: TCacheStatus = "enable";
const cookieExpire = Number(env.COOKIE_EXPIRE);
const _config = {
  redisUserCache,
  redisProductsCache,
  redisOrdersCache,
  redisSignUpCache,
  fDomainName: env.F_Domain_NAME as string,
  bHost: isDevelopment ? "localhost:3000" : (env.B_HOST as string),
  bProtocol: isDevelopment ? "http://" : (env.B_PROTOCOL as string),
  isDevelopment,
  bPort: (env.B_PORT as string) || 4000,
  jwtExpireTime: env.JWT_EXPIRE_TIME as string,
  jwtSecretCode: env.JWT_SECRET_CODE as string,
  cookieName: env.COOKIE_NAME as string,
  cookieExpire,

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
  smtpService: env.SMTP_SERVICE,
  smtpMail: env.SMTP_MAIL,
  smtpPassword: env.SMTP_PASSWORD,
  smtpHost: env.SMTP_HOST,
  smtpPort: env.SMTP_PORT,
};
export default Object.freeze(_config);