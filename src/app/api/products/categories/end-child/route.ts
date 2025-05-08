import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { error401, error500, success200 } from "@/lib/utils";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return error401("Unauthorized");
    }

    const parentIdDocs = await db.category.findMany({
      where: { parentId: { not: null } },
      select: { parentId: true },
      distinct: ["parentId"], // Get unique parent IDs
      
    });
    
    // Extract unique parent IDs and filter out nulls
    const parentIds = parentIdDocs.map(doc => doc.parentId).filter((id): id is string => id !== null);
    
    // Get categories that are NOT parents
    const categories = await db.category.findMany({
      where: { id: { notIn: parentIds } },
      orderBy: { name: "asc" },
      select: { parentId: true ,name:true,id:true}
    });
    if (!categories) return error500({ categories: null });
    return success200({ categories });
  } catch (error) {

    return error500({ categories: null });
  }
}
