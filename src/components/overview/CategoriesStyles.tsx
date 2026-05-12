import { useGetCategories } from "@/services/testimonies.service";

export const getCategoryStyle = (categoryName: string) => {
    const categories = useGetCategories();
    const mapedcategory = categories?.data?.map((category) => category.name);
    console.log("Mapped category ", mapedcategory)

    
}