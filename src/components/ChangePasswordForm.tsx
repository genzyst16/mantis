"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";

export function ChangePasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    
    setIsSubmitting(true);
    const result = await updatePassword(userId, password);
    
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      // The server action redirects on success
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input 
          id="password"
          type="password" 
          required 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Enter new password"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input 
          id="confirm"
          type="password" 
          required 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          placeholder="Confirm new password"
        />
      </div>
      
      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Update Password
      </Button>
    </form>
  );
}
