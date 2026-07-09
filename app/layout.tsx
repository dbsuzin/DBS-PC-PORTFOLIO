import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

// Use system fonts to avoid build issues with Geist
const fontClass = "font-sans";

export const metadata: Metadata = {
  title: "PC Portfolio | Inventário de Computadores",
  description: "Gerencie o portfólio de computadores dos seus clientes em um só lugar. Cadastre empresas e visualize as configurações de todos os PCs.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
