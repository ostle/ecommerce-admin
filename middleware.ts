import { NextResponse } from "next/server";

import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
	publicRoutes: ["/api/:path*"],
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
