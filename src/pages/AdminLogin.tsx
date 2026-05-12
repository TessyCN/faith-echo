import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Church, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLoginAdmin } from "@/services/auth.service";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAdminAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description:
          "Please enter email and password.",
        variant: "destructive",
      });

      return;
    }

    const success = await login(email, password);
    console.log("Admin Login Success : ", success);
    if (success) {
      toast({
        title: "Login successful",
      });

      navigate("/admin/dashboard");
    } else {
      toast({
        title: "Login failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Church className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">FFI Testimonies Moderation</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg shadow-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@FFIchurch.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={128}
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isLoading ? "Signing in..." : "Login"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <button type="button" className="hover:text-primary underline transition-colors">
              Forgot Password?
            </button>
          </p>
        </form>

        {/* Dev hint */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Demo: admin@FFIchurch.org / admin123
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
