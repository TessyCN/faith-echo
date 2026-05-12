import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestimonyCategory } from "@/types";


export interface Testimony {
  id: string;
  title: string;
  content: string;
  authorName: string;
  category: any;
}

export  interface TestimonyType {
title: string,
content: string,
authorName: string,
authorEmail: string,
categoryId: number
}

interface TestimonyCardProps {
  testimony: Testimony;
}

// Generate a deterministic color based on category name
export function getCategoryStyle(categories: TestimonyCategory[]) {
  const getColorFromString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const colorSchemes = [
    { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
    { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
    { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
    { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
    { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
    { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
    { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
    { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
    { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-200" },
    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  ];
}

const TestimonyCard = ({ testimony }: TestimonyCardProps) => {
  return (
    <Link to={`/testimony/${testimony.id}`} className="block h-full">
      <Card className="group h-full transition-shadow duration-300 shadow-card hover:shadow-card-hover border-border cursor-pointer">
        <CardHeader className="pb-3">
          <Badge 
            variant="outline" 
            className={`w-fit text-xs font-medium ${getCategoryStyle(testimony?.category?.name)}`}
          >
            {testimony?.category?.name}
          </Badge>
          <h3 className="text-lg font-semibold text-card-foreground mt-2 group-hover:text-primary transition-colors">
            {testimony.title}
          </h3>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {testimony.content}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            — {testimony.authorName}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TestimonyCard;
