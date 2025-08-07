import { cloudinary, uploadBanner } from "@/config/cloudinary.config";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  error400,
  error401,
  error403,
  error500,
  success200,
} from "@/lib/utils";
import {
  ZodHeroBannerSchema,
  ZodMarqueeOfferSchema,
} from "@/lib/zod-schemas/schema";
import { HeroBanner } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { uid } from "uid";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return error401("Unauthorized");
    }

    if (session.user.role !== "SUPERADMIN") {
      return error403();
    }

    const data: {
      values: z.infer<typeof ZodHeroBannerSchema>;
      images: {
        image: string;
        imageSm: string;
      };
    } = await req.json();

    if (!data || !data.values || !data.images) {
      return error400("Invalid data format.", {});
    }
    const result = ZodHeroBannerSchema.safeParse(data.values);

    if (result.success) {
      const name = uid();
      const promises = [
        uploadBanner(data.images.image, "hero-banner", name),
        uploadBanner(data.images.imageSm, "hero-banner", name + "Sm"),
      ];
      const response = await Promise.all(promises);

      const newBanner = await db.heroBanner.create({
        data: {
          basePrice: Number(result.data.basePrice),
          description: result.data.description,
          offerPrice: Number(result.data.offerPrice),
          title: result.data.title,
          url: result.data.url,
          imageUrl: response.find((image) => !image.public_id.endsWith("Sm"))!
            .public_id,
          imageUrlSm: response.find((image) => image.public_id.endsWith("Sm"))!
            .public_id,
        },
      });

      return success200({ newBanner });
    }

    if (result.error) {
      return error400("Invalid data format.", {});
    }
  } catch (error) {
    return error500({});
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return error401("Unauthorized");
    }

    if (session.user.role !== "SUPERADMIN") {
      return error403();
    }

    const data: {
      id: string;
      values: z.infer<typeof ZodHeroBannerSchema>;
      images: { image: string; imageSm: string };
    } = await req.json();

    if (!data || !data.id || !data.values || !data.images) {
      return error400("Invalid data format.", {});
    }
    const result = ZodHeroBannerSchema.safeParse(data.values);

    if (result.success) {
      // Get current banner data to check for existing images
      const currentBanner = await db.heroBanner.findUnique({
        where: { id: data.id },
        select: {
          imageUrl: true,
          imageUrlSm: true,
        },
      });

      if (!currentBanner) {
        return error400("Banner not found", {});
      }

      let updatedData: any = {
        offerPrice: Number(data.values.offerPrice),
        basePrice: Number(data.values.basePrice),
        title: data.values.title,
        description: data.values.description,
        url: data.values.url,
      };

      // Check if main image needs to be updated
      if (data.images.image.startsWith("data:")) {
        // Delete old image if it exists
        if (currentBanner.imageUrl) {
          try {
            await cloudinary.uploader.destroy(currentBanner.imageUrl);
          } catch (error) {
            console.error("Error deleting old main image:", error);
          }
        }

        // Upload new image
        const name = uid();
        const response = await uploadBanner(data.images.image, "hero-banner", name);
        updatedData.imageUrl = response.public_id;
      }

      // Check if small image needs to be updated
      if (data.images.imageSm.startsWith("data:")) {
        // Delete old small image if it exists
        if (currentBanner.imageUrlSm) {
          try {
            await cloudinary.uploader.destroy(currentBanner.imageUrlSm);
          } catch (error) {
            console.error("Error deleting old small image:", error);
          }
        }

        // Upload new small image
        const name = uid();
        const response = await uploadBanner(data.images.imageSm, "hero-banner", name + "Sm");
        updatedData.imageUrlSm = response.public_id;
      }

      const updatedResult = await db.heroBanner.update({
        where: {
          id: data.id,
        },
        data: updatedData,
      });

      return success200({ updatedResult });
    }
    if (result.error) {
      return error400("Invalid data format.", {});
    }
  } catch (error) {
    console.error("Hero banner update error:", error);
    return error500({});
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return error401("Unauthorized");
    }

    if (session.user.role !== "SUPERADMIN") {
      return error403();
    }

    const id = req.nextUrl.searchParams.get("id");
    const publicId = req.nextUrl.searchParams.get("publicId");

    if (!id || !publicId)
      return error400("Banner Id or Public Id missing or invalid", {});

    const Banner = await db.heroBanner.findUnique({
        where: { id: id },
        select: {
          imageUrl: true,
          imageUrlSm: true,
        },
      });

      if (!Banner) {
        return error400("Banner not found", {});
      }

    const promises = [
      cloudinary.uploader.destroy(`${Banner.imageUrl}`),
      cloudinary.uploader.destroy(`${Banner.imageUrlSm}`),
      db.heroBanner.delete({
        where: {
          id: id,
        },
      }),
    ];

    await Promise.all(promises);

    return success200({});
  } catch (error) {
    return error500({});
  }
}
