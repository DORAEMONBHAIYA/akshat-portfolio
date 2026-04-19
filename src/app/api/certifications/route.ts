import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return validateToken(token);
}

export async function GET() {
  try {
    const certifications = await db.certification.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Certifications GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const certification = await db.certification.create({
      data: {
        title: body.title,
        issuer: body.issuer ?? "",
        description: body.description ?? "",
        date: body.date ?? "",
        credentialUrl: body.credentialUrl ?? "",
        credentialId: body.credentialId ?? "",
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error("Certifications POST error:", error);
    return NextResponse.json(
      { error: "Failed to create certification" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, ...data } = body;
    if (!id)
      return NextResponse.json(
        { error: "Certification ID is required" },
        { status: 400 },
      );
    const certification = await db.certification.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.issuer !== undefined && { issuer: data.issuer }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.credentialUrl !== undefined && {
          credentialUrl: data.credentialUrl,
        }),
        ...(data.credentialId !== undefined && {
          credentialId: data.credentialId,
        }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
    return NextResponse.json(certification);
  } catch (error) {
    console.error("Certifications PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getAuth(req);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { error: "Certification ID is required" },
        { status: 400 },
      );
    await db.certification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Certifications DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete certification" },
      { status: 500 },
    );
  }
}
