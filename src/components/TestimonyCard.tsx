import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type TestimonyCategory = "Healing" | "Provision" | "Deliverance" | "Breakthrough";

export interface Testimony {
  id: string;
  title: string;
  snippet: string;
  contributor: string;
  category: TestimonyCategory;
}

interface TestimonyCardProps {
  testimony: Testimony;
}

const categoryStyles: Record<TestimonyCategory, string> = {
  Healing: "bg-healing/10 text-healing border-healing/20",
  Provision: "bg-provision/10 text-provision border-provision/20",
  Deliverance: "bg-deliverance/10 text-deliverance border-deliverance/20",
  Breakthrough: "bg-breakthrough/10 text-breakthrough border-breakthrough/20",
};

const TestimonyCard = ({ testimony }: TestimonyCardProps) => {
  return (
    <Link to={`/testimony/${testimony.id}`} className="block h-full">
      <Card className="group h-full transition-shadow duration-300 shadow-card hover:shadow-card-hover border-border cursor-pointer">
        <CardHeader className="pb-3">
          <Badge 
            variant="outline" 
            className={`w-fit text-xs font-medium ${categoryStyles[testimony.category]}`}
          >
            {testimony.category}
          </Badge>
          <h3 className="text-lg font-semibold text-card-foreground mt-2 group-hover:text-primary transition-colors">
            {testimony.title}
          </h3>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {testimony.snippet}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            — {testimony.contributor}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TestimonyCard;
