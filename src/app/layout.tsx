"use client";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import TopNav from "./components/topnav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const authLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];

  const navItems = [
    { name: "My Fridge", href: "/dashboard" },
    { name: "Saved Recipes", href: "/dashboard/saved" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!loading && session) {
      router.push("/dashboard");
    }
  }, [loading, session, router]);


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopNav links={session ? navItems : authLinks}/>
        {children}
      </body>
    </html>
  );
}

