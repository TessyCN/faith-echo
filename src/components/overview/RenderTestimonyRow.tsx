 



import {Badge } from "@/components/ui/badge"
import { AdaptedTestimony, getCategoryColor } from "@/pages/AdminDashboard";
import { Button } from "../ui/button";
import { ChevronRight, Edit3 } from "lucide-react";
import { format } from "date-fns";

interface RenderTestimonyRowProps {
  t: AdaptedTestimony;
  openDetail: (t: AdaptedTestimony) => void;
  startEdit: (t: AdaptedTestimony) => void;
  setConfirmDialog: (dialog: { open: boolean; type: "approve" | "reject"; testimonyId: string }) => void;
}

export const RenderTestimonyRow = ({ t, openDetail, startEdit, setConfirmDialog }: RenderTestimonyRowProps) => {
    return (
      <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-lg bg-card hover:shadow-[var(--card-hover-shadow)] transition-shadow cursor-pointer" onClick={() => openDetail(t)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{t.title}</h4>
            <Badge variant="outline" className={`text-xs flex-shrink-0 ${getCategoryColor(t.category)}`}>
              {t.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{t.snippet}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{t.contributor}</span>
            <span>{format(t.createdAt, "MMM d, yyyy")}</span>
            <span>{t.views} views</span>
          </div>
        </div>
        {t.status === "pending" && (
          <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" onClick={() => setConfirmDialog({ open: true, type: "approve", testimonyId: t.id })}>Approve</Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirmDialog({ open: true, type: "reject", testimonyId: t.id })}>Reject</Button>
            <Button size="sm" variant="outline" onClick={() => { openDetail(t); setTimeout(() => startEdit(t), 0); }}>
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
      </div>
    );
  };