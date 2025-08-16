// app/layout.tsx
import SessionProviderWrapper from "@/utils/SessionProviderWrapper";
import "./globals.css";
import Navbar from "@/components/Navbar";
 // adjust path if needed

export const metadata = {
  title: "Notes App",
  description: "Simple Notes Application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <div className='w-screen h-screen m-auto'>
      <Navbar />

            {children}
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
