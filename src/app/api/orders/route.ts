import { NextRequest, NextResponse } from "next/server";
import { order, PrismaClient, user } from "@prisma/client";

const prisma = new PrismaClient();

type CartItem = {
  id: number;
  name: string;
  offerRate?: number;
  price?: number;
  quantity: number;
};

function unitPrice(item: CartItem): number {
  return Number(item.offerRate ?? item.price ?? 0);
}

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

    let existingUser = await prisma.user.findFirst({
      where: { contact },
    });

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: { name, contact, address },
      });
    }

    const total = cart.reduce(
      (sum, item) => sum + unitPrice(item) * item.quantity,
      0
    );

    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found.` },
          { status: 404 }
        );
      }

      if ((product.quantity ?? 0) < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} has only ${product.quantity} left.` },
          { status: 400 }
        );
      }

      await prisma.product.update({
        where: { id: item.id },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    const createdOrder = await prisma.order.create({
      data: {
        userId: existingUser.id,
        total,
        products: cart,
      },
    });

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
