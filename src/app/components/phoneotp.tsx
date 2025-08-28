"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PhoneOTP () {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resent, setResent] = useState(60);
    const [step, setStep] = useState<"phone" | "otp">("phone");

    const handleSendCode = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ phone });
    
        if (error) {
          alert(error.message);
        } else {
          setStep("otp");
        }
        setLoading(false);
    };

    const handleVerify = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
    });

    if (error) {
        alert(error.message);
    } else {
        router.push("/dashboard");
    }
    setLoading(false);
    };

    return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-[300px] h-[400px] flex items-center justify-center flex-col">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        {step === "phone" ? (
            <>
                <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                {loading ? "Sending..." : "Send Code"}
                </button>
            </>
        ) : (
            <>
                <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter verification code"
                className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                {loading ? "Verifying..." : "Verify"}
                </button>
            </>
        )}
      </div>
    );
}