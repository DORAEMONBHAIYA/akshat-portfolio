import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const certs = await db.certification.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(certs);
  } catch (error) {
    console.error("Failed to fetch certifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cert = await db.certification.create({
      data: {
        title: body.title || "",
        issuer: body.issuer || "",
        date: body.date || "",
        description: body.description || "",
        credentialUrl: body.credentialUrl || "",
        credentialId: body.credentialId || "",
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(cert);
  } catch (error) {
    console.error("Failed to create certification:", error);
    return NextResponse.json(
      { error: "Failed to create certification" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const cert = await db.certification.update({
      where: { id: body.id },
      data: {
        title: body.title,
        issuer: body.issuer,
        date: body.date,
        description: body.description,
        credentialUrl: body.credentialUrl,
        credentialId: body.credentialId,
        order: body.order,
      },
    });
    return NextResponse.json(cert);
  } catch (error) {
    console.error("Failed to update certification:", error);
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.certification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete certification:", error);
    return NextResponse.json(
      { error: "Failed to delete certification" },
      { status: 500 },
    );
  }
}
