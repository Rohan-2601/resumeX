import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "WARNING: Cloudinary environment variables are missing. PDF uploads/deletions will fail.",
  );
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/**
 * Generates signature for secure frontend uploads.
 */
export const generateUploadSignature = (folder) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET,
  );
  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  };
};

/**
 * Safely deletes a Cloudinary asset.
 * Catches 'not found' errors to keep deletion idempotent.
 */
export const deleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    if (result.result === "not found") {
      console.log(`Cloudinary asset not found (already deleted?): ${publicId}`);
    } else if (result.result !== "ok") {
      console.warn(`Cloudinary deletion returned unexpected result for ${publicId}:`, result);
    } else {
      console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error.message);
    // Don't throw. We want the DB deletion to continue even if this fails.
    return null;
  }
};

export default cloudinary;
