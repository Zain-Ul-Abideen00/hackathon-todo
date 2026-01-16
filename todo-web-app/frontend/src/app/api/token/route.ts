import { SignJWT } from "jose";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);

		// Pattern A: Manually mint HS256 JWT for Python backend
		const token = await new SignJWT({
			sub: session.user.id,
			...session.user, // Include other user fields
		})
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("7d")
			.sign(secret);

		return NextResponse.json({ token });
	} catch (e) {
		console.error("Token generation failed:", e);
		return NextResponse.json({ error: "Internal Error" }, { status: 500 });
	}
}
