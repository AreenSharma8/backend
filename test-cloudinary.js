// test-cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

console.log("Cloud name:", JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME));
console.log("API key:", JSON.stringify(process.env.CLOUDINARY_API_KEY));
console.log("API secret length:", process.env.CLOUDINARY_API_SECRET?.length);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.uploader.upload("C:\\Users\\AREEN PIHU SHARMA\\Downloads\\user.png")
    .then(res => console.log("SUCCESS:", res.url))
    .catch(err => console.log("FAILED:", err));