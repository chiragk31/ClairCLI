"use client";

import { authClient } from "@/lib/auth-client";
import type React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";




const DeviceAuthorizationPage = () => {

    const [userCode, setUserCode] = useState("")
    const [error, setError] = useState < string | null > (null); 
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
    
    try {
      // Format the code: remove dashes and convert to uppercase
      const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase();
      // Check if the code is valid using GET /device endpoint
      const response = await authClient.device({
        query: { user_code: formattedCode },
      });
      
      if (response.data) {
        // Redirect to approval page
        router.push(`/approve?user_code=${formattedCode}`)
      }
    } catch (err) {
      setError("Invalid or expired code");
        }
    finally {
        setIsLoading(false)
        }
  };
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z 0-9]/g, "")
        if (value.length > 4) {
            value=value.slice(0,4) + "-" + value.slice(4,8)
        }
        setUserCode(value)
        
    }
  return (
     
 <div className="min-h-screen flex items-center justify-center bg-background px-4">
  <div className="w-full max-w-md">
    
    {/* Header Section */}
    <div className="flex flex-col items-center gap-4 mb-10">
      <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40">
        <ShieldAlert className="w-8 h-8 text-yellow-300" />
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Device Authorization
        </h1>
        <p className="text-muted-foreground">
          Enter your device code to continue
        </p>
      </div>
    </div>

    {/* Form Section */}
    <form
      onSubmit={handleSubmit}
      className="border border-dashed border-zinc-700 rounded-xl p-8 bg-zinc-950/80 backdrop-blur-sm shadow-md"
    >
      <div className="space-y-6">

        {/* Code Input */}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Device Code
          </label>

          <input
            id="code"
            type="text"
            value={userCode}
            onChange={handleCodeChange}
            placeholder="XXXX-XXXX"
            maxLength={9}
            className="w-full px-4 py-3 bg-zinc-900 border border-dashed border-zinc-700 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-300/50 font-mono text-center text-lg tracking-[0.4em]"
          />

          <p className="text-xs text-muted-foreground mt-2">
            You can find this code in your Clair CLI device authorization prompt.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || userCode.length < 9}
          className="w-full py-3 px-4 bg-amber-200 text-zinc-950 font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Continue"}
        </button>

        {/* Info Box */}
        <div className="p-4 bg-zinc-900 border border-dashed border-zinc-700 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This code is unique to your device and will expire soon. Keep it confidential
            and never share it with anyone.
          </p>
        </div>

      </div>
    </form>

  </div>
</div>

  )
}

export default DeviceAuthorizationPage
