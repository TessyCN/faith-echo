import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useLoginAdmin } from "@/services/auth.service";

interface AdminAuthContextType {
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  logout: () => void;

  isLoading: boolean;

  error: string | null;

}

const AdminAuthContext =
  createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setIsAuthenticated(!!token);
  }, []);

  const mutate = useLoginAdmin();


  const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const data = await mutate.mutateAsync({
      email,
      password,
    });

    localStorage.setItem(
      "token",
      data.access_token
    );

    setIsAuthenticated(true);

    return true;
  } catch (error) {
    setIsAuthenticated(false);

    return false;
  }
};

  const logout = () => {
    localStorage.removeItem("token");

    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isLoading: mutate.isPending,
        error: mutate.error?.message || null,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used within AdminAuthProvider"
    );
  }

  return context;
};