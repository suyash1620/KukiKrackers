import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// ✅ Define ProductBody type for safety
type ProductBody = {
  name: string;
  quantity: number;
  image: string;
  youtubeUrl?: string;
  price: number;
};

// ✅ GET: Fetch all products (sorted by newest)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error(" Error fetching products:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ✅ POST: Add a new product
export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as ProductBody;
    const { name, quantity, image, youtubeUrl, price } = data;

    // 🔹 Basic validation
    if (!name || !image || price == null || quantity == null) {
      return NextResponse.json(
        { error: "All required fields must be filled." },
        { status: 400 }
      );
    }

    // 🔹 Create new product in DB
    const product = await prisma.product.create({
      data: {
        name,
        quantity,
        image,
        youtubeUrl: youtubeUrl || "",
        price,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(" Error creating product:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
