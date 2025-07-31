// app/layout.tsx
import SessionProviderWrapper from "@/utils/SessionProviderWrapper";
import "./globals.css";
 // adjust path if needed

export const metadata = {
  title: "Your App",
  description: "Whatever",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
