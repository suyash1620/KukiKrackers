import { NextRequest, NextResponse } from "next/server";
import { order, PrismaClient, user  } from "@prisma/client";

const prisma = new PrismaClient();

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export async function GET() {
  const orders: (order & { user: user | null })[] = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      name,
      contact,
      address,
      cart,
    }: { name: string; contact: string; address: string; cart: CartItem[] } = data;

    if (!name || !contact || !address || !cart || cart.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // 🧍‍♂️ Create or find existing user
    let user = await prisma.user.findFirst({
      where: { contact },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name, contact, address },
      });
    }

    // 🧮 Calculate total
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 🔍 Check and update product quantities
    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json({ error: `Product ${item.name} not found.` }, { status: 404 });
      }

      if ((product.quantity ?? 0) < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} has only ${product.quantity} left.` },
          { status: 400 }
        );
      }

      // ✅ Deduct quantity
      await prisma.product.update({
        where: { id: item.id },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 💾 Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        products: cart,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
