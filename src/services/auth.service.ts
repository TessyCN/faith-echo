import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";



export const loginAdmin = async (
  email: string,
  password: string
) => {
  
  const url = import.meta.env.VITE_BE_API_URL;
  const response = await axios.post(`${url}/admin/login`, {
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