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
    // // security
    // JWT_SECRET_CODE: "harshadkunarsahu170220007771998614", //
    // JWT_EXPIRE_TIME: "24h", //
    // // data base
    // MongoDB_URL:
    //   "mongodb+srv://toShowOffSkillsUser:MtDuIlEAzTfsNz42@toshowoffskills.bg8pm.mongodb.net/?retryWrites=true&w=majority&appName=toShowOffSkills", //
    // // cloudinary
    // CLOUDINARY_NAME: "de9mwcmc4", //
    // CLOUDINARY_API: "425189718364363", //
    // CLOUDINARY_SECRET: "b6FNTFvJaQSUVqa5JlGUYReTF58", //
    // // redis
    // REDIS_PASSWORD: "DneZppkVrJcosoKQ2ywuLh2CrBnQHwoz", //
    // REDIS_HOST: "redis-13472.c330.asia-south1-1.gce.redns.redis-cloud.com", //
    // REDIS_PORT: 13472, //
    // // --------------- Mails send -----------------
    // // harshadecommerceapp@gmail.com
    // ORDER_SERVICE: "gmail",
    // ORDER_PASSWORD: "nhxp payx kzyh kzkk",
    // ORDER_HOST: "smtp.gmail.com",
    // ORDER_PORT: 465,
  },
};

export default nextConfig;
