import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// TODO: Aktivera ClerkProvider när du har riktiga API-nycklar
// import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "haus-node — AI Creative Studio",
  description:
    "Node-based AI image, video and media generation. Build powerful creative workflows.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(222 47% 8%)",
              border: "1px solid hsl(217 33% 14%)",
              color: "hsl(210 40% 96%)",
            },
          }}
        />
      </body>
    </html>
  );
}
