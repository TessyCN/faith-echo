import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Send, User, FileText, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { value: "healing", label: "Healing" },
  { value: "provision", label: "Provision" },
  { value: "deliverance", label: "Deliverance" },
  { value: "breakthrough", label: "Breakthrough" },
];

const Submit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    testimony: "",
    category: "",
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your testimony.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.testimony.trim()) {
      toast({
        title: "Testimony required",
        description: "Please share your testimony story.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a category for your testimony.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission (replace with actual API call)
    setTimeout(() => {
      toast({
        title: "Testimony submitted!",
        description: "Thank you for sharing. Your testimony will be reviewed shortly.",
      });
      setIsSubmitting(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Share Your Testimony
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Your story can inspire faith and hope in others.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 md:py-16">
          <div className="container max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name Field with Anonymity Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name" className="text-base font-medium">
                    Your Name
                    <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">
                      Submit anonymously
                    </Label>
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={(checked) => {
                        setIsAnonymous(checked);
                        if (checked) {
                          setFormData((prev) => ({ ...prev, name: "" }));
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder={isAnonymous ? "Anonymous" : "Enter your name"}
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={isAnonymous}
                    className="pl-10"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-medium">
                  Title of Testimony
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    placeholder="Give your testimony a meaningful title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="pl-10"
                    maxLength={150}
                    required
                  />
                </div>
              </div>

              {/* Testimony Text Area */}
              <div className="space-y-3">
                <Label htmlFor="testimony" className="text-base font-medium">
                  Your Testimony
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Textarea
                  id="testimony"
                  placeholder="Share your story of God's faithfulness in your life..."
                  value={formData.testimony}
                  onChange={(e) => setFormData((prev) => ({ ...prev, testimony: e.target.value }))}
                  className="min-h-[200px] resize-y"
                  maxLength={5000}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.testimony.length}/5000 characters
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Upload Evidence
                  <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                </Label>
                <p className="text-sm text-muted-foreground -mt-1">
                  Images, PDFs, audio, or short videos (max 10MB)
                </p>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {formData.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium text-foreground">{formData.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,audio/*,video/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-3">
                <Label htmlFor="category" className="text-base font-medium">
                  Category
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Testimony
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;
