// import prisma from "@/lib/db";

// // Get all users
// export async function GET() {
//   const users = await prisma.user.findMany({
//     include: { orders: true },
//   });
//   return Response.json(users);
// }

// // Create user
// export async function POST(req) {
//   const data = await req.json();
//   const { name, contact, address } = data;

//   const user = await prisma.user.create({
//     data: { name, contact, address },
//   });

//   return Response.json(user);
// }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type UserBody = {
  name: string;
  contact: string;
  address: string;
};

export async function GET() {
  const users = await prisma.user.findMany({
    include: { orders: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const data: UserBody = await req.json();
  const { name, contact, address } = data;

  const user = await prisma.user.create({
    data: { name, contact, address },
  });

  return NextResponse.json(user);
}
