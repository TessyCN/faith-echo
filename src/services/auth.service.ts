import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/axiosInstance";
import { useMutation } from "@tanstack/react-query";



export const loginAdmin = async (
  email: string,
  password: string
) => {
  const response = await api.post("/admin/login", {
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