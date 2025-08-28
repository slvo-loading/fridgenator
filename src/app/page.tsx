"use client";
import React, { useState, useEffect } from "react";
import PhoneOTP from "./components/phoneotp";
import { supabase } from "./lib/supabaseClient";


export default function Home() {

  useEffect(() => {

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Current session:", data.session);
    };

    checkSession();
  })

  return (
    <div className="flex min-h-screen gap-3 items-center justify-center">
      <PhoneOTP />
      <div className="flex flex-col items-center gap-1">
          <h1>🥛 🥬 🥩</h1>
          <h1>Welcome to Fridgenator!</h1>
          <h1>some tagline</h1>
        </div>
    </div>
  );
}