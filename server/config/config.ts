import { TCacheStatus } from "../interfaces/redis";

const env = process.env;
const isDevelopment: boolean = env.NODE_ENV === "development";

// ------------------ Redis -----------------
// `user:${_id}` JSON.stringify(findUser)
const redisUserCache: TCacheStatus = "enable";
const redisUserExpire: number = 86400;

const redisOrdersCache: TCacheStatus = "enable";
const redisProductsCache: TCacheStatus = "enable";
const redisProductExpire: number = 86400;
const redisSingleProCache: TCacheStatus = "enable";
const redisSingleProExpire: number = 86400;
const redisSignUpCache: TCacheStatus = "enable";
const cookieExpire = Number(env.COOKIE_EXPIRE);
const _config = {
  redisUserCache,
  redisUserExpire,
  redisProductsCache,
  redisProductExpire,
  redisSingleProCache,
  redisSingleProExpire,
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

  // -------------- Api Data Limits ------------
  productPerReq: Number(env.PRODUCT_PER_REQ),
  suggestionPerReq: Number(env.SUGGESTION_PER_REQ),
  searchesQty: Number(env.SEARCHES_QTY),
  interestedSearch: Number(env.INTERESTED_SEARCH),
};

const deliveryTime = {
  districtMinTime: 4,
  districtMaxTime: 5,
  stateMinTime: 8,
  stateMaxTime: 10,
  countryMinTime: 10,
  countryMaxTime: 14,
};

export const newPasswordToken = 3;
export const emailVerificationToken = 5;
export const incorrectPasswords = 3;
export const tokenValidityMinute = 15;
export { deliveryTime };
export default Object.freeze(_config);
