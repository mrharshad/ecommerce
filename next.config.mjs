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
  env: {},
};

export default nextConfig;
