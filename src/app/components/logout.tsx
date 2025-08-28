"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Logout() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
          console.log("Logging out...");
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Logout failed:", error.message);
            return;
          }
          router.push("/"); // Redirect after logout
        } catch (err) {
          console.error("Unexpected error during logout:", err);
        }
    };

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
            Logout
        </button>
    );
}