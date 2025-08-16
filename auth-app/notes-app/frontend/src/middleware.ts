 // adjust path as needed
import { withAuth } from "next-auth/middleware";

export default withAuth(
  // You can put custom logic here to allow/deny access
  // Return Response.redirect or false for unauthenticated users
);

export const config = {
  matcher: ["/dashboard/:path*"], // Protect /dashboard and children
};
