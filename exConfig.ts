const redisExpire = 86400;
export const msADay = 86400000;
export const indiaOffset = 19800000;
export const suggestions = {
  showClient: 10,
  perRequest: 200,
};

export const searches = {
  searchMax: 35,
  interestedMax: 15,
  newReqByPriority: 3,
  storeName: "Searches", // localstore me save hoga iss name se
  // istna bar kisi category / type  ke product ko open karne par automatic searches me add kar diya jaiga
  autoAddCategory: 15,
  autoAddTOfP: 5,
};

export const viewedProLocal = "ViewedProduct"; //

export const pathLocal = "Path"; //

export const orderManage = {
  mail: "harshadecommerceapp@gmail.com",
  phoneNo: 7771998614,
  cache: true,
  expire: redisExpire,
  newOrders: "newOrders:",
  canceled: "canceled:",
  delivered: "delivered:",
};

export const defaultRating = 4;
export const deliveryTime = {
  districtMinTime: 4,
  districtMaxTime: 5,
  stateMinTime: 8,
  stateMaxTime: 10,
  countryMinTime: 10,
  countryMaxTime: 14,
};

const perReqProducts = 3;

export const keySearchPro = {
  keyPerReq: perReqProducts,
  keyCache: true,
  keyExpire: redisExpire,
  keyName: "searchKey:",
};

export const suggestedPro = {
  suggestedPerReq: perReqProducts,
  suggestedCache: true,
  suggestedExpire: redisExpire,
};

export const singleProduct = {
  cache: true,
  expire: redisExpire,
  keyName: "single:",
};

export const user = {
  cache: true,
  expire: redisExpire,
  keyName: "user:",
};

export const email = {
  emailCache: true,
  emailExpire: redisExpire,
  emailKeyName: "mail:",
  tokenLimit: 5,
  wait: 24, // hours
};

export const password = {
  tokenLimit: 3,
  tokenExpired: 15, // minute
  incorrectLimit: 3,
  wait: 24, // hours
};

// -----------------------------------------------//
// export const backEndServer = {
//   protocol: "http://",
//   hostname: "192.168.29.183:3000",
//   tLD: "",
// };

// export const frontEndServer = {
//   protocol: "http://",
//   hostname: "192.168.29.183:3000",
//   tLD: "",
// };
export const backEndServer = {
  protocol: "https://",
  hostname: "ecommerce-phi-neon",
  tLD: ".vercel.app",
};

export const frontEndServer = {
  protocol: "https://",
  hostname: "ecommerce-phi-neon",
  tLD: ".vercel.app",
};
