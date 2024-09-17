import { v2 } from "cloudinary";
import config from "./config";
const { cloudinaryApi, cloudinaryName, cloudinarySecret } = config;

const cloudinaryConfig = v2;

cloudinaryConfig.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryApi,
  api_secret: cloudinarySecret,
  secure: true,
});

export default cloudinaryConfig;
