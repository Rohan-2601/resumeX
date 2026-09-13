import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  try {
    // We need a valid publicId of an existing PDF uploaded to the dev environment.
    // I will list assets to find one.
    const result = await cloudinary.api.resources({ type: 'upload', resource_type: 'image', max_results: 5 });
    const pdfs = result.resources.filter(r => r.format === 'pdf');
    if (pdfs.length === 0) {
      console.log("No PDFs found");
      return;
    }
    const publicId = pdfs[0].public_id;
    console.log("Found PDF:", publicId);

    const eagerResult = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      resource_type: "image",
      eager: [
        { width: 800, crop: "scale", format: "jpg", page: 1 }
      ]
    });
    console.log("Eager result:", JSON.stringify(eagerResult, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
