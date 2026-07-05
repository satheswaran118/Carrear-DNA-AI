import { useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, TrendingDown, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { runSkillGapAgent } from "@/lib/agents"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onResultUpdate: (key: string, value: unknown) => void
}

const priorityColors: Record<string, string> = { high: "destructive", medium: "secondary", low: "outline" }
const difficultyColors: Record<string, string> = { hard: "text-red-500", medium: "text-amber-500", easy: "text-green-500" }

export function SkillGapAnalysis({ state, onResultUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const gap = state.results.skillGap

  const handleAnalyze = async () => {
    if (!state.apiKey) { setError("Configure Groq API key in Settings first."); return }
    if (!state.profile.skills?.length) { setError("Complete your resume analysis or profile first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runSkillGapAgent(state.profile, state.apiKey)
      onResultUpdate("skillGap", result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Check your API key.")
    } finally {
      setLoading(false)
    }
  }

  const radarData = gap?.currentSkills?.slice(0, 8).map(s => ({ subject: s.skill, value: s.level })) ?? []
  const barColors = ["#8b5cf6", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#f97316", "#6366f1"]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analysis</h1>
          <p className="text-muted-foreground mt-1">Identify what you need to learn to reach your target role</p>
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
          {loading ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {!gap && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Zap className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Click "Run Analysis" to discover your skill gaps</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Requires resume analysis or profile completion</p>
          </CardContent>
        </Card>
      )}

      {gap && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Overall", value: gap.overallReadiness ?? 0, color: "bg-violet-500" },
              { label: "AI Ready", value: gap.aiReadiness ?? 0, color: "bg-blue-500" },
              { label: "Interview", value: gap.interviewReadiness ?? 0, color: "bg-green-500" },
              { label: "Portfolio", value: gap.portfolioStrength ?? 0, color: "bg-amber-500" },
              { label: "Career", value: gap.careerHealth ?? 0, color: "bg-pink-500" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="pt-4 pb-3">
                  <div className={`w-8 h-1.5 rounded-full ${s.color} mb-2`} />
                  <p className="text-2xl font-bold">{s.value}<span className="text-xs text-muted-foreground">%</span></p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          {radarData.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Skill Levels</CardTitle>
                  <CardDescription>Radar chart of your current proficiencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skill Proficiency Bars</CardTitle>
                  <CardDescription>Your current skill levels (0–100)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={radarData} layout="vertical" margin={{ left: 20, right: 10 }}>
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {radarData.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="size-4 text-green-500" />Strength Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gap.strengthAreas?.map(a => (
                    <div key={a} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                      <span className="text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="size-4 text-red-500" />Weak Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gap.weakAreas?.map(a => (
                    <div key={a} className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-amber-500 shrink-0" />
                      <span className="text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Missing Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skills to Acquire</CardTitle>
              <CardDescription>Prioritized list of missing skills for {gap.targetRole}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gap.missingSkills?.map(skill => (
                  <div key={skill.skill} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{skill.skill}</span>
                        <Badge variant={priorityColors[skill.priority] as "destructive" | "secondary" | "outline"} className="text-xs capitalize">{skill.priority}</Badge>
                        <span className={`text-xs capitalize ${difficultyColors[skill.difficulty]}`}>{skill.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={skill.priority === "high" ? 10 : skill.priority === "medium" ? 30 : 50} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{skill.timeToLearn}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Skills Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Skill Proficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gap.currentSkills?.map(skill => (
                  <div key={skill.skill}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{skill.skill}</span>
                        <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                      </div>
                      <span className="text-sm font-semibold">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
