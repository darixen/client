// app/layout.tsx
import { ColorSchemeScript } from "@mantine/core";
import { MainProvider } from "@/providers/MainProvider"; // Import the new client file

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css"

export const metadata = {
  title: "DARK CAPITAL",
  description: "Enterprise RWA Investment Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mantine-color-scheme="dark">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body style={{ backgroundColor: '#050505' }}>
        {/* Pass children to the Client Provider */}
        <MainProvider>
          <div className="min-h-screen flex flex-col text-gray-300">
            {children}
          </div>
        </MainProvider>
      </body>
    </html>
  );
}