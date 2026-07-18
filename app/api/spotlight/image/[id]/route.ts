import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Serves the spotlight photo stored in him_spotlight.image. Public content —
// the spotlight pages themselves are public. Immutable-ish: cache aggressively.
export const GET = async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params
    const numId = Number(id)
    if (!Number.isInteger(numId) || numId <= 0)
        return new NextResponse(null, { status: 400 })

    try {
        const row = await db.him_spotlight.findUnique({
            where: { id: numId, hidden: false },
            select: { image: true, image_mime: true }
        })
        if (!row?.image)
            return new NextResponse(null, { status: 404 })

        return new NextResponse(Buffer.from(row.image), {
            headers: {
                "Content-Type": row.image_mime || "image/jpeg",
                "Cache-Control": "public, max-age=86400, s-maxage=86400"
            }
        })
    } catch {
        return new NextResponse(null, { status: 500 })
    }
}
