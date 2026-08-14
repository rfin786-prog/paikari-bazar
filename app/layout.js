import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
});
export const metadata = {
  title: "Rupanjel — Bangladesh's Baby & Kids Lifestyle Store",
  description: "Thoughtfully made clothing for every age, from New Born to Kids",
  icons: {
    icon: "/favicon.png",
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-hind-siliguri), sans-serif', background: '#f5f5f5' }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
