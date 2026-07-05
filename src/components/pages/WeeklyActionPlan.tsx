import { useState } from "react"
import { AlertCircle, Calendar, CheckCircle2, Loader2, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { runCareerCoachAgent } from "@/lib/agents"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onResultUpdate: (key: string, value: unknown) => void
}

type DayPlan = { day: string; tasks: string[] }
type Milestone = { week: number; goal: string }

export function WeeklyActionPlan({ state, onResultUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  type Coaching = {
    motivationalMessage?: string
    weeklyGoals?: string[]
    dailyTasks?: DayPlan[]
    successPrediction?: string
    learningStrategy?: string
    mindsetAdvice?: string
    milestones?: Milestone[]
    productivityTips?: string[]
    timeManagement?: string[]
  }
  const coaching = state.results.coaching as Coaching | undefined

  const handleGenerate = async () => {
    if (!state.apiKey) { setError("Configure Groq API key in Settings first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runCareerCoachAgent(state.profile, state.apiKey)
      onResultUpdate("coaching", result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate plan.")
    } finally {
      setLoading(false)
    }
  }

  const dayColors: Record<string, string> = {
    Monday: "bg-blue-500",
    Tuesday: "bg-violet-500",
    Wednesday: "bg-amber-500",
    Thursday: "bg-green-500",
    Friday: "bg-pink-500",
    Saturday: "bg-cyan-500",
    Sunday: "bg-orange-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Action Plan</h1>
          <p className="text-muted-foreground mt-1">Your personal career coach — weekly goals, daily tasks, and milestone tracking</p>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Calendar className="size-4" />}
          {loading ? "Generating..." : "Generate Plan"}
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {!coaching && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Calendar className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Get your personalized weekly action plan from your AI career coach</p>
          </CardContent>
        </Card>
      )}

      {coaching && (
        <div className="space-y-6">
          {/* Motivational Message */}
          {coaching.motivationalMessage && (
            <Card className="bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 border-violet-500/20">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium text-sm mb-1">Your Career Coach Says:</p>
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{coaching.motivationalMessage}"</p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Target className="size-4 text-violet-500" />Weekly Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {coaching.weeklyGoals?.map((goal, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 size-5 rounded-full border-2 border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm">{goal}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="size-4 text-green-500" />Success Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coaching.successPrediction && (
                  <p className="text-sm leading-relaxed">{coaching.successPrediction}</p>
                )}
                <Separator />
                {coaching.learningStrategy && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Learning Strategy</p>
                    <p className="text-sm text-muted-foreground">{coaching.learningStrategy}</p>
                  </div>
                )}
                {coaching.mindsetAdvice && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Mindset Advice</p>
                    <p className="text-sm text-muted-foreground">{coaching.mindsetAdvice}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Schedule</CardTitle>
              <CardDescription>Structured day-by-day learning and execution plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-3">
                {coaching.dailyTasks?.map((day, i) => (
                  <div key={i} className="space-y-2">
                    <div className={`${dayColors[day.day] ?? "bg-primary"} text-white rounded-lg px-3 py-2 text-center`}>
                      <p className="text-xs font-semibold">{day.day}</p>
                    </div>
                    <div className="space-y-1.5">
                      {day.tasks?.map((task, j) => (
                        <div key={j} className="text-xs p-2 rounded bg-muted/50 border leading-relaxed">
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          {(coaching.milestones?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coaching.milestones?.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Badge variant="outline" className="shrink-0">Week {m.week}</Badge>
                      <p className="text-sm">{m.goal}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="grid md:grid-cols-2 gap-4">
            {(coaching.productivityTips?.length ?? 0) > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Productivity Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coaching.productivityTips?.map((tip, i) => (
                      <p key={i} className="text-xs text-muted-foreground">⚡ {tip}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {(coaching.timeManagement?.length ?? 0) > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Time Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coaching.timeManagement?.map((tip, i) => (
                      <p key={i} className="text-xs text-muted-foreground">🕐 {tip}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
