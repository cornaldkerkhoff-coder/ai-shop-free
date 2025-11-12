import "./globals.css";
export const metadata = { title: "AI Shop", description: "Autonome demo shop op Vercel" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">AI Shop</a>
            <nav className="text-sm">
              <a className="hover:underline" href="/">Producten</a>
              <a className="ml-4 hover:underline" href="/admin/orders">Admin</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
            © {new Date().getFullYear()} AI Shop — demo op Vercel
          </div>
        </footer>
      </body>
    </html>
  );
}