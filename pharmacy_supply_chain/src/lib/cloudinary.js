const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

function getCloudinaryUploadUrl() {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local");
  }
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local");
  }
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}

export async function uploadDamageProof(file) {
  if (!file) {
    throw new Error("Select a damage image before upload.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cloudinary upload failed");
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    assetId: payload.asset_id,
  };
}
