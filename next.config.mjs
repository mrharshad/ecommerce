/**
 *  @type {import('next').NextConfig}
 */
const nextConfig = {
  scrollRestoration: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // port: "",
        // pathname: "/",
      },
    ],
  },
  env: {
    // frontend server
    F_Domain_NAME: "ecommerce", //
    F_TLD: ".com", //

    // backend server
    B_PORT: 3000,
    B_PROTOCOL: "https://", //
    B_HOST: "localhost", //
    // security
    JWT_SECRET_CODE: "harshadkunarsahu170220007771998614", //
    JWT_EXPIRE_TIME: "24h", //

    COOKIE_NAME: "token", //
    COOKIE_EXPIRE: 1, //

    // data base
    MongoDB_URL:
      "mongodb+srv://toShowOffSkillsUser:MtDuIlEAzTfsNz42@toshowoffskills.bg8pm.mongodb.net/?retryWrites=true&w=majority&appName=toShowOffSkills", //

    // cloudinary
    CLOUDINARY_NAME: "de9mwcmc4", //
    CLOUDINARY_API: "425189718364363", //
    CLOUDINARY_SECRET: "b6FNTFvJaQSUVqa5JlGUYReTF58", //

    // redis
    REDIS_PASSWORD: "DneZppkVrJcosoKQ2ywuLh2CrBnQHwoz", //
    REDIS_HOST: "redis-13472.c330.asia-south1-1.gce.redns.redis-cloud.com", //
    REDIS_PORT: 13472, //

    // Mails send
    SMTP_SERVICE: "gmail", //
    SMTP_MAIL: "harshadecommerceapp@gmail.com", //
    SMTP_PASSWORD: "nhxp payx kzyh kzkk", //
    SMTP_HOST: "smtp.gmail.com", //
    SMTP_PORT: 465, //

    // -------------- Api Data Limits ------------
    PRODUCT_PER_REQ: 28, //
    SUGGESTION_PER_REQ: 200, //
    SEARCHES_QTY: 50, //
    INTERESTED_SEARCH: 15, //

    // -------------- Minimum Data ------------
  },
};

export default nextConfig;
