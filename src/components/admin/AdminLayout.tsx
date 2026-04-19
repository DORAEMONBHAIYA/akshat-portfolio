"use client";

import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Cpu,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Tag,
  Trophy,
  BarChart3,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStore } from "@/store/admin-store";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy load section components
const Dashboard = lazy(() => import("./Dashboard"));
const ProfileEditor = lazy(() => import("./ProfileEditor"));
const ProjectsManager = lazy(() => import("./ProjectsManager"));
const SkillsManager = lazy(() => import("./SkillsManager"));
const ExperienceManager = lazy(() => import("./ExperienceManager"));
const EducationManager = lazy(() => import("./EducationManager"));
const BlogManager = lazy(() => import("./BlogManager"));
const ContactManager = lazy(() => import("./ContactManager"));
const CategoryManager = lazy(() => import("./CategoryManager"));
const AchievementManager = lazy(() => import("./AchievementManager"));
const HeroStatsManager = lazy(() => import("./HeroStatsManager"));
const CertificationsManager = lazy(() => import("./CertificationsManager"));

interface AdminLayoutProps {
  onBack: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "hero-stats", label: "Hero Stats", icon: BarChart3 },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "skills", label: "Skills", icon: Cpu },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "messages", label: "Messages", icon: Mail },
];

function SectionLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function SidebarNav({
  activeSection,
  onNavigate,
  onLogout,
  username,
}: {
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  username: string | null;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-neon/10 flex items-center justify-center border border-neon/20">
          <Settings className="h-5 w-5 text-neon" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm">
            Portfolio Admin
          </h1>
          <p className="text-xs text-muted-foreground">Management Panel</p>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-neon/10 text-neon border border-neon/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-neon" : ""}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="h-1.5 w-1.5 rounded-full bg-neon"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-border" />

      {/* User section */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8 border border-neon/20">
            <AvatarFallback className="bg-neon/10 text-neon text-xs font-mono">
              {username?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ onBack }: AdminLayoutProps) {
  const activeSection = useAdminStore((s) => s.activeSection);
  const setActiveSection = useAdminStore((s) => s.setActiveSection);
  const logout = useAdminStore((s) => s.logout);
  const username = useAdminStore((s) => s.username);
  const isMobile = useIsMobile();

  const activeItem = navItems.find((n) => n.id === activeSection);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <ProfileEditor />;
      case "projects":
        return <ProjectsManager />;
      case "hero-stats":
        return <HeroStatsManager />;
      case "categories":
        return <CategoryManager />;
      case "skills":
        return <SkillsManager />;
      case "experience":
        return <ExperienceManager />;
      case "education":
        return <EducationManager />;
      case "certifications":
        return <CertificationsManager />;
      case "achievements":
        return <AchievementManager />;
      case "blog":
        return <BlogManager />;
      case "messages":
        return <ContactManager />;
      default:
        return <Dashboard />;
    }
  };

  const sidebarContent = (
    <SidebarNav
      activeSection={activeSection}
      onNavigate={setActiveSection}
      onLogout={logout}
      username={username}
    />
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-[280px] flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-sm"
        >
          {sidebarContent}
        </motion.aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] p-0 bg-card border-border"
                >
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            )}

            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onBack();
                    }}
                    className="text-muted-foreground hover:text-neon"
                  >
                    Portfolio
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">
                    {activeItem?.label || "Dashboard"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop user dropdown */}
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-3"
                  >
                    <Avatar className="h-7 w-7 border border-neon/20">
                      <AvatarFallback className="bg-neon/10 text-neon text-xs font-mono">
                        {username?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden lg:inline">{username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile logout */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Suspense fallback={<SectionLoader />}>
                {renderSection()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
