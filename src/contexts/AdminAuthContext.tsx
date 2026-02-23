import { createContext, useContext, useState, ReactNode } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// Mock credentials for MVP
const MOCK_EMAIL = "admin@gracechurch.org";
const MOCK_PASSWORD = "admin123";

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));
    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      setIsAuthenticated(true);
      setAdminEmail(email);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminEmail(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, adminEmail, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
