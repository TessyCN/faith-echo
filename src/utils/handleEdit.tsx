import { useUpdateTestimony } from "@/services/testimonies.service";

export const handleEdit = async (id: string) => {
    const updateTestimonyMutation = useUpdateTestimony();
    try {
      await updateTestimonyMutation.mutateAsync({
        id: parseInt(id),
        title: editForm.title,
        content: editForm.fullStory,
        categoryId: editForm.categoryId
      });

      addAuditEntry(id, editForm.title, "Edited", `Updated title, category, or content`);

      toast({
        title: "Testimony Updated",
        description: "Changes saved successfully."
      });

      setEditMode(false);

      if (selectedTestimony) {
        setSelectedTestimony({
          ...selectedTestimony,
          title: editForm.title,
          category: editForm.categoryName,
          categoryId: editForm.categoryId,
          fullStory: editForm.fullStory,
        });
      }

      setConfirmDialog({ open: false, type: "approve", testimonyId: "" });

      await refetchPending();
      await refetchApproved();
      await refetchRejected();

    } catch (error) {
      console.error("Error updating testimony:", error);
      toast({
        title: "Error",
        description: "Failed to update testimony. Please try again.",
        variant: "destructive",
      });
    }
  };