import { useState, useCallback } from "react"
import {
  BarChart3, BookOpen, BrainCircuit, Briefcase, CalendarDays,
  ChevronRight, FileText, Home, Mic2, Settings, Target,
  TrendingUp, Zap, Sparkles,
} from "lucide-react"

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"

import { Dashboard }        from "@/components/pages/Dashboard"
import { ResumeAnalysis }   from "@/components/pages/ResumeAnalysis"
import { ProjectSuggestions } from "@/components/pages/ProjectSuggestions"
import { CareerMatch }      from "@/components/pages/CareerMatch"
import { LearningRoadmap }  from "@/components/pages/LearningRoadmap"
import { JobRecommendations } from "@/components/pages/JobRecommendations"
import { SkillGapAnalysis } from "@/components/pages/SkillGapAnalysis"
import { InterviewPrep }    from "@/components/pages/InterviewPrep"
import { WeeklyActionPlan } from "@/components/pages/WeeklyActionPlan"
import { ProgressTracker }  from "@/components/pages/ProgressTracker"
import { Settings as SettingsPage } from "@/components/pages/Settings"

import type { AppState, CareerProfile, AgentResults, PageId } from "@/lib/types"

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultProfile: CareerProfile = {
  name: "", title: "", summary: "",
  skills: [], technologies: [], softSkills: [],
  experience: [], education: [], projects: [], achievements: [],
  yearsOfExperience: 0, targetRole: "", targetSalary: "",
  preferredCountry: "United States", targetIndustry: "Technology",
}

const getInitialApiKey = () => {
  const envKey = import.meta.env.VITE_GROQ_API_KEY ?? ""
  const storedKey = localStorage.getItem("careerdna_api_key")
  const oldKey = "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"
  if (storedKey === oldKey || !storedKey) {
    if (storedKey === oldKey) {
      localStorage.setItem("careerdna_api_key", envKey)
    }
    return envKey
  }
  return storedKey
}

const defaultState: AppState = {
  apiKey: getInitialApiKey(),
  model: localStorage.getItem("careerdna_model") ?? "llama-3.1-8b-instant",
  profile: defaultProfile,
  results: {}, loading: {}, errors: {},
  completedCourses: [], completedProjects: [], completedSkills: [],
  weeklyProgress: 0,
}

// ── Nav config ────────────────────────────────────────────────────────────────

interface NavItem {
  id: PageId
  label: string
  icon: React.ElementType
  color: string          // icon bg gradient
  badge?: string
}

const navMain: NavItem[] = [
  { id: "dashboard", label: "Dashboard",       icon: Home,       color: "from-blue-400 to-indigo-500"  },
  { id: "resume",    label: "Resume Analysis", icon: FileText,   color: "from-violet-400 to-purple-500" },
  { id: "skills",    label: "AI Skill Analyzer",icon: BrainCircuit,color: "from-cyan-400 to-blue-500"  },
  { id: "career",    label: "Career Match",    icon: Target,     color: "from-rose-400 to-pink-500"    },
  { id: "roadmap",   label: "Learning Roadmap",icon: BookOpen,   color: "from-amber-400 to-orange-500" },
]

const navTools: NavItem[] = [
  { id: "jobs",      label: "Job Recommendations", icon: Briefcase,  color: "from-teal-400 to-emerald-500" },
  { id: "gap",       label: "Skill Gap Analysis",  icon: BarChart3,  color: "from-orange-400 to-red-500"   },
  { id: "interview", label: "Interview Prep",      icon: Mic2,       color: "from-purple-400 to-indigo-500"},
  { id: "planner",   label: "Weekly Action Plan",  icon: CalendarDays,color: "from-pink-400 to-rose-500"  },
]

const navTracking: NavItem[] = [
  { id: "progress",  label: "Progress Tracker",   icon: TrendingUp, color: "from-green-400 to-emerald-500"},
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<AppState>(defaultState)
  const [page, setPage]   = useState<PageId>("dashboard")

  const updateProfile = useCallback((patch: Partial<CareerProfile>) =>
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } })), [])

  const updateResult = useCallback((key: string, value: unknown) =>
    setState(s => ({ ...s, results: { ...s.results, [key]: value } })), [])

  const toggleCompleted = useCallback((type: "courses" | "projects" | "skills", item: string) => {
    const key = `completed${type.charAt(0).toUpperCase()}${type.slice(1)}` as
      "completedCourses" | "completedProjects" | "completedSkills"
    setState(s => {
      const list = s[key] as string[]
      return { ...s, [key]: list.includes(item) ? list.filter(i => i !== item) : [...list, item] }
    })
  }, [])

  const handleApiKeyChange = useCallback((key: string) => {
    localStorage.setItem("careerdna_api_key", key)
    setState(s => ({ ...s, apiKey: key }))
  }, [])

  const handleModelChange = useCallback((model: string) => {
    localStorage.setItem("careerdna_model", model)
    setState(s => ({ ...s, model }))
  }, [])

  const handleLoadDemo = useCallback((profile: CareerProfile, results: AgentResults) => {
    setState(s => ({ ...s, profile, results }))
    setPage("dashboard")
  }, [])

  const handleReset = useCallback(() => {
    localStorage.removeItem("careerdna_api_key")
    setState({ ...defaultState, apiKey: "" })
    setPage("dashboard")
  }, [])

  const renderPage = () => {
    switch (page) {
      case "dashboard":  return <Dashboard state={state} />
      case "resume":     return <ResumeAnalysis state={state} onProfileUpdate={updateProfile} onResultUpdate={updateResult} />
      case "skills":     return <ProjectSuggestions state={state} onResultUpdate={updateResult} />
      case "career":     return <CareerMatch state={state} onResultUpdate={updateResult} />
      case "roadmap":    return <LearningRoadmap state={state} onResultUpdate={updateResult} />
      case "jobs":       return <JobRecommendations state={state} onResultUpdate={updateResult} />
      case "gap":        return <SkillGapAnalysis state={state} onResultUpdate={updateResult} />
      case "interview":  return <InterviewPrep state={state} onResultUpdate={updateResult} />
      case "planner":    return <WeeklyActionPlan state={state} onResultUpdate={updateResult} />
      case "progress":   return <ProgressTracker state={state} onToggleCompleted={toggleCompleted} onWeeklyProgressChange={v => setState(s => ({ ...s, weeklyProgress: v }))} />
      case "settings":   return <SettingsPage state={state} onApiKeyChange={handleApiKeyChange} onModelChange={handleModelChange} onLoadDemo={handleLoadDemo} onReset={handleReset} />
      default: return null
    }
  }

  const allNavItems = [...navMain, ...navTools, ...navTracking]
  const hasApiKey  = !!state.apiKey
  const hasProfile = !!state.profile.name || state.profile.skills.length > 0

  // ── Nav group component ───────────────────────────────────────────────────
  function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
    return (
      <SidebarGroup className="px-3 py-1">
        <SidebarGroupLabel className="text-white/40 text-[10px] font-bold uppercase tracking-widest px-1 mb-1">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            {items.map(item => {
              const isActive = page === item.id
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setPage(item.id)}
                    tooltip={item.label}
                    className={`
                      cursor-pointer h-9 rounded-xl px-2 gap-3 transition-all duration-200
                      ${isActive
                        ? "bg-white/15 text-white shadow-sm border border-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
                      }
                    `}
                  >
                    {/* Colored icon box */}
                    <span className={`
                      shrink-0 size-6 rounded-lg flex items-center justify-center
                      bg-gradient-to-br ${item.color}
                      ${isActive ? "shadow-md" : "opacity-70 group-hover:opacity-100"}
                      transition-opacity
                    `}>
                      <item.icon className="size-3.5 text-white" />
                    </span>
                    <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge className="ml-auto text-xs px-1.5 py-0 bg-white/20 text-white border-0">
                        {item.badge}
                      </Badge>
                    )}
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="ml-auto size-1.5 rounded-full bg-white shrink-0" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">

        {/* ── Header ── */}
        <SidebarHeader className="px-3 py-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="shrink-0 size-9 rounded-xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Zap className="size-5 text-white" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
              <span className="text-sm font-extrabold text-white tracking-tight leading-tight">CareerDNA AI</span>
              <span className="text-[10px] text-white/50 font-medium">Career Operating System</span>
            </div>
            <div className="ml-auto group-data-[collapsible=icon]:hidden">
              <Sparkles className="size-4 text-purple-300" />
            </div>
          </div>

          {/* Profile pill — only when profile loaded */}
          {hasProfile && (
            <div className="group-data-[collapsible=icon]:hidden mt-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <div className="size-7 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {state.profile.name?.[0] ?? "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {state.profile.name || "Profile Loaded"}
                </p>
                <p className="text-[10px] text-white/50 truncate">
                  {state.profile.title || state.profile.targetRole || "Candidate"}
                </p>
              </div>
            </div>
          )}
        </SidebarHeader>

        {/* ── Nav ── */}
        <SidebarContent className="gap-0 overflow-x-hidden">
          <NavGroup label="Overview"  items={navMain}     />
          <NavGroup label="AI Tools"  items={navTools}    />
          <NavGroup label="Tracking"  items={navTracking} />
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="px-3 pb-4">
          {/* Divider */}
          <div className="h-px bg-white/10 mb-2" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={page === "settings"}
                onClick={() => setPage("settings")}
                tooltip="Settings"
                className={`
                  cursor-pointer h-9 rounded-xl px-2 gap-3 transition-all duration-200
                  ${page === "settings"
                    ? "bg-white/15 text-white shadow-sm border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
                  }
                `}
              >
                <span className="shrink-0 size-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-400 to-gray-600">
                  <Settings className="size-3.5 text-white" />
                </span>
                <span className="text-sm font-medium">Settings</span>
                {!hasApiKey && (
                  <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
                    Setup
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ── Main content ── */}
      <SidebarInset>
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
            <span className="hidden sm:flex items-center gap-1">
              <Zap className="size-3.5 text-purple-500" />
              <span>CareerDNA AI</span>
            </span>
            <ChevronRight className="size-3.5 hidden sm:block shrink-0" />
            <span className="font-semibold text-foreground truncate">
              {allNavItems.find(n => n.id === page)?.label ?? "Settings"}
            </span>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {!hasApiKey && (
              <button
                onClick={() => setPage("settings")}
                className="text-xs text-amber-500 hover:text-amber-600 font-semibold hidden sm:flex items-center gap-1"
              >
                ⚠ Configure API key
              </button>
            )}
            {hasProfile && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="size-4 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{state.profile.name?.[0] ?? "?"}</span>
                </div>
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  {state.profile.name || "Profile loaded"}
                </span>
              </div>
            )}
            <ModeToggle />
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="border-t py-4 px-6 text-center">
          <p className="text-xs text-muted-foreground">
            CareerDNA AI — Your Personal Career Operating System · Powered by Llama 3.3 70B via Groq
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
