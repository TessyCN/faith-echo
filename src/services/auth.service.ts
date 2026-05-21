import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";



const BASE_API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_BE_API_URL;

export const loginAdmin = async (
  email: string,
  password: string
) => {
  const response = await axios.post(`${BASE_API_URL}/admin/login`, {
    email,
    password,
  });

  return response.data;
};

const useLoginAdmin = () => {
  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => loginAdmin(email, password),
  });
};



const useLogoutAdmin = () => {
    return useMutation({
        mutationFn: async () => {
            localStorage.removeItem("token");
            toast({
                title: "Logout successful",
                variant: "default",
            });
            window.location.href = "/admin/login";
        },
    });
};


export {
    useLoginAdmin,
    useLogoutAdmin
}