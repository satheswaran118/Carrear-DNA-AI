import { Brain, Briefcase, FileText, Flame, Rocket, Shield, Star, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
}

function ScoreCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}<span className="text-sm text-muted-foreground font-normal">/100</span></p>
          </div>
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="size-5 text-white" />
          </div>
        </div>
        <Progress value={value} className="mt-4 h-1.5" />
      </CardContent>
    </Card>
  )
}

export function Dashboard({ state }: Props) {
  const { profile, results } = state
  const gap = results.skillGap

  const scores = [
    { label: "Skill Score", value: profile.skillScore ?? 72, icon: Brain, color: "bg-violet-500" },
    { label: "Experience Score", value: profile.experienceScore ?? 65, icon: Briefcase, color: "bg-blue-500" },
    { label: "AI Readiness", value: gap?.aiReadiness ?? 50, icon: Zap, color: "bg-amber-500" },
    { label: "Interview Ready", value: gap?.interviewReadiness ?? 60, icon: Star, color: "bg-green-500" },
    { label: "Portfolio Strength", value: gap?.portfolioStrength ?? 55, icon: Rocket, color: "bg-pink-500" },
    { label: "Resume Quality", value: profile.resumeQuality ?? 78, icon: FileText, color: "bg-cyan-500" },
    { label: "Career Health", value: gap?.careerHealth ?? 65, icon: Flame, color: "bg-orange-500" },
    { label: "Overall Readiness", value: gap?.overallReadiness ?? 58, icon: TrendingUp, color: "bg-indigo-500" },
  ]

  const radarData = [
    { subject: "Skills", A: profile.skillScore ?? 72 },
    { subject: "Experience", A: profile.experienceScore ?? 65 },
    { subject: "AI Ready", A: gap?.aiReadiness ?? 50 },
    { subject: "Interview", A: gap?.interviewReadiness ?? 60 },
    { subject: "Portfolio", A: gap?.portfolioStrength ?? 55 },
    { subject: "Resume", A: profile.resumeQuality ?? 78 },
  ]

  const barData = scores.map(s => ({ name: s.label.split(" ")[0], score: s.value }))
  const barColors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#22c55e", "#ec4899", "#06b6d4", "#f97316", "#6366f1"]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{profile.name || "Professional"}</span> — your AI career operating system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Shield className="size-3 mr-1.5" />
            {profile.targetRole || "Defining target role..."}
          </Badge>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scores.map(s => <ScoreCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Career Readiness Radar</CardTitle>
            <CardDescription>Multi-dimensional competency assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
            <CardDescription>Performance across all career dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {(profile.skills || []).slice(0, 12).map(s => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
              {(profile.skills?.length ?? 0) > 12 && (
                <Badge variant="outline" className="text-xs">+{(profile.skills?.length ?? 0) - 12} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Target Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Role</span>
              <span className="font-medium">{profile.targetRole || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Salary</span>
              <span className="font-medium">{profile.targetSalary || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Industry</span>
              <span className="font-medium">{profile.targetIndustry || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Country</span>
              <span className="font-medium">{profile.preferredCountry || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Key Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(gap?.missingSkills || []).slice(0, 5).map(s => (
                <div key={s.skill} className="flex items-center justify-between">
                  <span className="text-sm">{s.skill}</span>
                  <Badge
                    variant={s.priority === "high" ? "destructive" : s.priority === "medium" ? "secondary" : "outline"}
                    className="text-xs capitalize"
                  >
                    {s.priority}
                  </Badge>
                </div>
              ))}
              {!gap?.missingSkills?.length && (
                <p className="text-sm text-muted-foreground">Run Skill Gap Analysis to see gaps</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Learning Progress</CardTitle>
          <CardDescription>Track your completed courses, projects, and skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-violet-500">{state.completedCourses.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Courses Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">{state.completedProjects.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Projects Built</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-500">{state.completedSkills.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Skills Acquired</p>
            </div>
          </div>
          <Progress value={state.weeklyProgress} className="mt-6 h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-center">{state.weeklyProgress}% weekly goal achieved</p>
        </CardContent>
      </Card>
    </div>
  )
}
