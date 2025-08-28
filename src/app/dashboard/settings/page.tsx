"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/app/components/logout";


export default function About() {

  return (
    <div className="flex min-h-screen flex-col gap-3 items-center justify-center">
      settings
      <Logout />
    </div>
  );
}