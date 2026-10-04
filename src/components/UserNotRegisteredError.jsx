import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

export default function UserNotRegisteredError() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Access restricted</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your account isn't registered for this app yet. Ask the app owner for access, or sign in with a different account.
        </p>
        <Button variant="outline" onClick={() => logout()}>
          Sign in with another account
        </Button>
      </div>
    </div>
  );
}
