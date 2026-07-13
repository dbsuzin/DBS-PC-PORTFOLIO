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
        <body className="min-h-full flex flex-col bg-[#06080f] text-zinc-100 font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton toastOptions={{ style: { background: 'rgba(15, 18, 30, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(56, 189, 248, 0.15)', color: '#e4e4e7' } }} />
      </body>
    </html>
  );
}
