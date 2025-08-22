import {  NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/config/cloudinary.config";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "application/octet-stream";
    const filename = request.headers.get("x-vercel-filename") || "image.png";

    // Read file from request body
    const buffer = Buffer.from(await request.arrayBuffer());
    const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "sgtmake/editor",
      resource_type: "image",
      public_id: filename.split(".")[0], // use filename (without extension) as public_id
      format: "webp", // always convert to webp
      quality: "auto",
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}