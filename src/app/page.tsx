"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminStore } from "@/store/admin-store";
import { useSecretAdmin } from "@/hooks/use-secret-admin";
import Navbar from "@/components/portfolio/Navbar";
import HeroSection from "@/components/portfolio/HeroSection";
import AboutSection from "@/components/portfolio/AboutSection";
import SkillsSection from "@/components/portfolio/SkillsSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import ExperienceSection from "@/components/portfolio/ExperienceSection";
import EducationSection from "@/components/portfolio/EducationSection";
import CertificationsSection from "@/components/portfolio/CertificationsSection";
import BlogSection from "@/components/portfolio/BlogSection";
import AchievementSection from "@/components/portfolio/AchievementSection";
import ContactSection from "@/components/portfolio/ContactSection";
import Footer from "@/components/portfolio/Footer";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  resume: string;
  leetcode: string;
  titles: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  longDesc: string;
  techStack: string;
  github: string;
  liveUrl: string;
  featured: boolean;
}

interface ExperienceData {
  id: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  techStack: string;
}

interface EducationData {
  id: string;
  institution: string;
  degree: string;
  field: string;
  description: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface CertificationData {
  id: string;
  title: string;
  issuer: string;
  description: string;
  date: string;
  credentialUrl: string;
  credentialId: string;
}

interface BlogData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  published: boolean;
  createdAt: string;
}

interface AchievementData {
  id: string;
  title: string;
  description: string;
  date: string;
  techStack: string;
}

interface SkillData {
  name: string;
  level: number;
  category: string;
}

interface HeroStatData {
  id: string;
  label: string;
  value: string;
  icon: string;
  order: number;
}

type ViewMode = "portfolio" | "admin";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");
  const [loading, setLoading] = useState(true);

  // Portfolio data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [education, setEducation] = useState<EducationData[]>([]);
  const [certifications, setCertifications] = useState<CertificationData[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [heroStats, setHeroStats] = useState<HeroStatData[]>([]);

  // Admin state
  const isAuth = useAdminStore((s) => s.isAuth);
  const token = useAdminStore((s) => s.token);
  const setAuth = useAdminStore((s) => s.setAuth);

  // Restore admin session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedUsername = localStorage.getItem("admin_username");
    if (savedToken && savedUsername) {
      fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + savedToken,
        },
        body: JSON.stringify({ action: "validate" }),
      }).then((res) => {
        if (res.ok) {
          setAuth(true, savedToken, savedUsername);
        } else {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_username");
          setAuth(false, null, null);
        }
      });
    }
  }, [setAuth]);

  // Fetch portfolio data
  useEffect(() => {
    async function fetchData() {
      try {
        const [
          profileRes,
          skillsRes,
          projectsRes,
          expRes,
          eduRes,
          blogRes,
          achievementsRes,
          certificationsRes,
          heroStatsRes,
        ] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/skills"),
          fetch("/api/projects"),
          fetch("/api/experience"),
          fetch("/api/education"),
          fetch("/api/certifications"),
          fetch("/api/blog?published=true"),
          fetch("/api/achievements"),
          fetch("/api/hero-stats"),
        ]);

        const [
          profileData,
          skillsData,
          projectsData,
          expData,
          eduData,
          certificationsData,
          blogData,
          achievementsData,
          heroStatsData,
        ] = await Promise.all([
          profileRes.json(),
          skillsRes.json(),
          projectsRes.json(),
          expRes.json(),
          eduRes.json(),
          certificationsRes.json(),
          blogRes.json(),
          achievementsRes.json(),
          heroStatsRes.json(),
        ]);

        if (profileData && !profileData.error) setProfile(profileData);
        if (Array.isArray(skillsData)) setSkills(skillsData);
        if (Array.isArray(projectsData)) setProjects(projectsData);
        if (Array.isArray(expData)) setExperiences(expData);
        if (Array.isArray(eduData)) setEducation(eduData);
        if (Array.isArray(certificationsData))
          setCertifications(certificationsData);
        if (Array.isArray(blogData)) setBlogPosts(blogData);
        if (Array.isArray(achievementsData)) setAchievements(achievementsData);
        if (Array.isArray(heroStatsData)) setHeroStats(heroStatsData);
      } catch (err) {
        console.error("Failed to fetch portfolio data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAdminClick = useCallback(() => {
    setViewMode("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToPortfolio = useCallback(() => {
    setViewMode("portfolio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Secret admin access: Konami Code, Ctrl+Shift+A, #admin URL hash
  const { handleTripleClick } = useSecretAdmin(handleAdminClick);

  // Admin view
  if (viewMode === "admin") {
    if (!isAuth || !token) {
      return <AdminLogin onBack={handleBackToPortfolio} />;
    }
    return <AdminLayout onBack={handleBackToPortfolio} />;
  }

  // Portfolio loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="space-y-12">
            <div className="flex flex-col items-center gap-4 pt-20">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-12 w-96 max-w-full" />
              <Skeleton className="h-6 w-72 max-w-full" />
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-36" />
                ))}
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-48 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Portfolio view - pass profile data to ALL components
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        name={profile?.name}
        onLogoTripleClick={handleTripleClick}
        visibleSections={[
          "about",
          ...(skills.length > 0 ? ["skills"] : []),
          ...(projects.length > 0 ? ["projects"] : []),
          ...(experiences.length > 0 ? ["experience"] : []),
          ...(education.length > 0 ? ["education"] : []),
          ...(certifications.length > 0 ? ["certifications"] : []),
          ...(achievements.length > 0 ? ["achievements"] : []),
          ...(blogPosts.length > 0 ? ["blog"] : []),
          "contact",
        ]}
      />
      <main className="flex-1">
        <HeroSection
          name={profile?.name}
          title={profile?.title}
          tagline={profile?.tagline}
          resume={profile?.resume}
          stats={heroStats}
          typingTitles={
            profile?.titles
              ? profile.titles
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : undefined
          }
        />

        {profile && (
          <AboutSection
            profile={{
              name: profile.name,
              title: profile.title,
              tagline: profile.tagline,
              bio: profile.bio ? profile.bio.split("\n\n") : [],
              email: profile.email,
              phone: profile.phone,
              location: profile.location,
              website: profile.website,
              github: profile.github,
              linkedin: profile.linkedin,
              twitter: profile.twitter,
            }}
          />
        )}

        {skills.length > 0 && (
          <SkillsSection
            skills={skills.map((s) => ({
              name: s.name,
              level: s.level,
              category: s.category,
            }))}
          />
        )}

        {projects.length > 0 && (
          <ProjectsSection
            projects={projects.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              longDesc: p.longDesc,
              techStack: p.techStack
                ? p.techStack.split(",").map((t: string) => t.trim())
                : [],
              github: p.github,
              liveUrl: p.liveUrl,
              featured: p.featured,
              category: p.category?.name || "",
            }))}
          />
        )}

        {experiences.length > 0 && (
          <ExperienceSection
            experiences={experiences.map((e) => ({
              id: e.id,
              company: e.company,
              role: e.role,
              startDate: e.startDate,
              endDate: e.endDate,
              current: e.current,
              description: e.description
                ? e.description.split("\n").filter((d) => d.trim())
                : [],
              techStack: e.techStack
                ? e.techStack.split(",").map((t) => t.trim())
                : [],
            }))}
          />
        )}

        {education.length > 0 && (
          <EducationSection
            education={education.map((e) => ({
              id: e.id,
              institution: e.institution,
              degree: e.degree,
              field: e.field,
              gpa: e.gpa,
              startDate: e.startDate,
              endDate: e.endDate,
              description: e.description,
            }))}
          />
        )}

        {certifications.length > 0 && (
          <CertificationsSection
            certifications={certifications.map((c) => ({
              id: c.id,
              title: c.title,
              issuer: c.issuer,
              description: c.description,
              date: c.date,
              credentialUrl: c.credentialUrl,
              credentialId: c.credentialId,
            }))}
          />
        )}

        {blogPosts.length > 0 && (
          <BlogSection
            posts={blogPosts.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              content: p.content || "",
              tags: p.tags ? p.tags.split(",").map((t) => t.trim()) : [],
              createdAt: p.createdAt,
            }))}
          />
        )}

        {achievements.length > 0 && (
          <AchievementSection
            achievements={achievements.map((a) => ({
              id: a.id,
              title: a.title,
              description: a.description || "",
              date: a.date,
              techStack: a.techStack
                ? a.techStack.split(",").map((t: string) => t.trim())
                : [],
            }))}
          />
        )}

        <ContactSection
          email={profile?.email}
          phone={profile?.phone}
          location={profile?.location}
          website={profile?.website}
          github={profile?.github}
          linkedin={profile?.linkedin}
          twitter={profile?.twitter}
          leetcode={profile?.leetcode}
        />
      </main>
      <Footer
        name={profile?.name}
        github={profile?.github}
        linkedin={profile?.linkedin}
        twitter={profile?.twitter}
        website={profile?.website}
        leetcode={profile?.leetcode}
      />
    </div>
  );
}
