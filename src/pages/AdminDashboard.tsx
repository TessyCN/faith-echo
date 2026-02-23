import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  LogOut,
  Menu,
  X,
  Image,
  Video,
  Music,
  FileText,
  ChevronRight,
  Church,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { testimoniesData, TestimonyData, TestimonyStatus } from "@/data/testimonies";
import { TestimonyCategory } from "@/components/TestimonyCard";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type AdminView = "dashboard" | "pending" | "approved" | "rejected" | "analytics" | "detail";

const categoryStyles: Record<TestimonyCategory, string> = {
  Healing: "bg-healing/10 text-healing border-healing/20",
  Provision: "bg-provision/10 text-provision border-provision/20",
  Deliverance: "bg-deliverance/10 text-deliverance border-deliverance/20",
  Breakthrough: "bg-breakthrough/10 text-breakthrough border-breakthrough/20",
};

const mediaIcons = { image: Image, video: Video, audio: Music, pdf: FileText };

const navItems = [
  { key: "dashboard" as AdminView, label: "Dashboard", icon: LayoutDashboard },
  { key: "pending" as AdminView, label: "Pending", icon: Clock },
  { key: "approved" as AdminView, label: "Approved", icon: CheckCircle2 },
  { key: "rejected" as AdminView, label: "Rejected", icon: XCircle },
  { key: "analytics" as AdminView, label: "Analytics", icon: BarChart3 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAdminAuth();
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState<TestimonyData | null>(null);
  const [data, setData] = useState<TestimonyData[]>([...testimoniesData]);
  const [rejectionNote, setRejectionNote] = useState("");

  const counts = useMemo(() => ({
    pending: data.filter((t) => t.status === "pending").length,
    approved: data.filter((t) => t.status === "approved").length,
    rejected: data.filter((t) => t.status === "rejected").length,
    total: data.length,
  }), [data]);

  // Redirect after all hooks
  if (!isAuthenticated) {
    navigate("/admin", { replace: true });
    return null;
  }

  const filteredTestimonies = (status: TestimonyStatus) =>
    data.filter((t) => t.status === status).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleAction = (id: string, action: "approve" | "reject") => {
    setData((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: action === "approve" ? ("approved" as TestimonyStatus) : ("rejected" as TestimonyStatus),
              rejectionNote: action === "reject" ? rejectionNote : undefined,
            }
          : t
      )
    );
    toast({
      title: action === "approve" ? "Testimony Approved" : "Testimony Rejected",
      description: `The testimony has been ${action === "approve" ? "published" : "declined"}.`,
    });
    setRejectionNote("");
    setSelectedTestimony(null);
    setCurrentView(action === "approve" ? "approved" : "rejected");
  };

  const openDetail = (testimony: TestimonyData) => {
    setSelectedTestimony(testimony);
    setCurrentView("detail");
  };

  const handleLogout = () => {
    logout();
    navigate("/admin", { replace: true });
  };

  const goToView = (view: AdminView) => {
    setCurrentView(view);
    setSidebarOpen(false);
    if (view !== "detail") setSelectedTestimony(null);
  };

  const renderTestimonyRow = (t: TestimonyData) => {
    const MediaIcon = t.mediaType ? mediaIcons[t.mediaType] : null;
    return (
      <div
        key={t.id}
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-lg bg-card hover:shadow-card transition-shadow cursor-pointer"
        onClick={() => openDetail(t)}
      >
        {MediaIcon && (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <MediaIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{t.title}</h4>
            <Badge variant="outline" className={`text-xs flex-shrink-0 ${categoryStyles[t.category]}`}>
              {t.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{t.snippet}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>
              {t.isAnonymous ? (
                <>Anonymous <span className="text-muted-foreground/40 italic">({t.realName})</span></>
              ) : t.contributor}
            </span>
            <span>{format(t.createdAt, "MMM d, yyyy")}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
      </div>
    );
  };

  const renderQueue = (status: TestimonyStatus, emptyMessage: string) => {
    const items = filteredTestimonies(status);
    if (items.length === 0) return <p className="text-muted-foreground text-center py-12">{emptyMessage}</p>;
    return <div className="space-y-3">{items.map(renderTestimonyRow)}</div>;
  };

  const renderDetail = () => {
    if (!selectedTestimony) return null;
    const t = selectedTestimony;
    const MediaIcon = t.mediaType ? mediaIcons[t.mediaType] : null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => goToView(t.status as AdminView)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to {t.status} queue
        </button>

        <div>
          <Badge variant="outline" className={`mb-3 ${categoryStyles[t.category]}`}>{t.category}</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t.title}</h2>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            Contributor:{" "}
            {t.isAnonymous ? (
              <>Anonymous <span className="text-muted-foreground/40 italic">({t.realName})</span></>
            ) : <span className="text-foreground font-medium">{t.realName || t.contributor}</span>}
          </span>
          <span>Submitted: {format(t.createdAt, "MMMM d, yyyy 'at' h:mm a")}</span>
          <span>
            Status:{" "}
            <Badge variant={t.status === "approved" ? "default" : t.status === "rejected" ? "destructive" : "secondary"} className="ml-1">
              {t.status}
            </Badge>
          </span>
        </div>

        {MediaIcon && (
          <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
            <MediaIcon className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{t.fullStory}</p>
        </div>

        {t.status === "rejected" && t.rejectionNote && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium text-destructive mb-1">Rejection Note</p>
            <p className="text-sm text-foreground">{t.rejectionNote}</p>
          </div>
        )}

        {t.status === "pending" && (
          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="font-semibold text-foreground">Moderation Actions</h3>
            <div className="space-y-3">
              <Textarea
                placeholder="Optional rejection note..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex gap-3">
                <Button onClick={() => handleAction(t.id, "approve")} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => handleAction(t.id, "reject")} className="gap-2">
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDashboardOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, icon: BarChart3, color: "text-primary" },
          { label: "Pending", value: counts.pending, icon: Clock, color: "text-accent" },
          { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-healing" },
          { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-destructive" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Pending Review</h3>
          {counts.pending > 0 && (
            <button onClick={() => goToView("pending")} className="text-sm text-primary hover:underline">View all →</button>
          )}
        </div>
        {renderQueue("pending", "No pending testimonies 🎉")}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Analytics Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", value: counts.pending, pct: Math.round((counts.pending / Math.max(counts.total, 1)) * 100), color: "bg-accent" },
          { label: "Approved", value: counts.approved, pct: Math.round((counts.approved / Math.max(counts.total, 1)) * 100), color: "bg-healing" },
          { label: "Rejected", value: counts.rejected, pct: Math.round((counts.rejected / Math.max(counts.total, 1)) * 100), color: "bg-destructive" },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-5 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-foreground mb-3">{item.value}</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{item.pct}% of total</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-5 shadow-card">
        <p className="text-sm text-muted-foreground mb-1">Total Views (Approved)</p>
        <p className="text-3xl font-bold text-foreground">
          {data.filter((t) => t.status === "approved").reduce((sum, t) => sum + t.views, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );

  const viewTitle: Record<AdminView, string> = {
    dashboard: "Dashboard",
    pending: "Pending Testimonies",
    approved: "Approved Testimonies",
    rejected: "Rejected Testimonies",
    analytics: "Analytics",
    detail: selectedTestimony?.title || "Testimony Detail",
  };

  return (
    <div className="min-h-screen flex bg-muted/20">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Church className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">Admin Panel</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => goToView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                currentView === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.key === "pending" && counts.pending > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">{counts.pending}</Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground truncate">{viewTitle[currentView]}</h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === "dashboard" && renderDashboardOverview()}
          {currentView === "pending" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Pending Testimonies</h2>
              {renderQueue("pending", "No pending testimonies. All caught up! 🎉")}
            </div>
          )}
          {currentView === "approved" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Approved Testimonies</h2>
              {renderQueue("approved", "No approved testimonies yet.")}
            </div>
          )}
          {currentView === "rejected" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Rejected Testimonies</h2>
              {renderQueue("rejected", "No rejected testimonies.")}
            </div>
          )}
          {currentView === "analytics" && renderAnalytics()}
          {currentView === "detail" && renderDetail()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
