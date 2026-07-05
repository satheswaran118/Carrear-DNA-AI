import { useState } from "react"
import { AlertCircle, BookOpen, ExternalLink, Loader2, Map } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { runLearningPlannerAgent } from "@/lib/agents"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onResultUpdate: (key: string, value: unknown) => void
}

type PlanPhase = { goals?: string[]; courses?: Array<{title: string; platform: string; free?: boolean}>; projects?: string[]; skills?: string[]; certifications?: string[]; milestones?: string[]; expectedRole?: string; expectedSalary?: number }

export function LearningRoadmap({ state, onResultUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  type LearningPlan = {
    weeklyHours?: number
    dailyPlan?: string[]
    month1?: PlanPhase
    month3?: PlanPhase
    month6?: PlanPhase
    month12?: PlanPhase
    resources?: {
      freeCourses?: Array<{title: string; platform: string; topic: string}>
      paidCourses?: Array<{title: string; platform: string; price: string}>
      books?: Array<{title: string; author: string}>
      youtubeChannels?: string[]
      platforms?: string[]
      documentation?: string[]
    }
  }
  const plan = state.results.learningPlan as LearningPlan | undefined

  const handleGenerate = async () => {
    if (!state.apiKey) { setError("Configure Groq API key in Settings first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runLearningPlannerAgent(state.profile, state.results.skillGap ?? {}, state.apiKey)
      onResultUpdate("learningPlan", result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate roadmap.")
    } finally {
      setLoading(false)
    }
  }

  const phases = [
    { key: "month1", label: "Month 1", color: "bg-blue-500", description: "Foundation & Basics" },
    { key: "month3", label: "Month 3", color: "bg-violet-500", description: "Intermediate Skills" },
    { key: "month6", label: "Month 6", color: "bg-amber-500", description: "Advanced Projects" },
    { key: "month12", label: "Month 12", color: "bg-green-500", description: "Job Ready" },
  ]

  const resources = plan?.resources

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Roadmap</h1>
          <p className="text-muted-foreground mt-1">Personalized 12-month learning plan tailored to your career goals</p>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Map className="size-4" />}
          {loading ? "Generating..." : "Generate Roadmap"}
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {!plan && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Map className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Generate your personalized learning roadmap</p>
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="space-y-6">
          {/* Weekly hours + daily plan */}
          {plan.weeklyHours && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-blue-500/20">
              <CardContent className="pt-5 pb-5 flex items-center gap-6">
                <div>
                  <p className="text-3xl font-bold">{plan.weeklyHours}h</p>
                  <p className="text-sm text-muted-foreground">per week recommended</p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Daily Learning Plan</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.dailyPlan?.map((task, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{task}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-8">
              {phases.map((phase, i) => {
                const data = plan[phase.key as keyof typeof plan] as PlanPhase | undefined
                if (!data) return null
                const isLeft = i % 2 === 0
                return (
                  <div key={phase.key} className={`relative flex items-start gap-4 md:gap-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-1 z-10">
                      <div className={`size-8 rounded-full ${phase.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                        {i + 1}
                      </div>
                    </div>
                    <Card className={`ml-14 md:ml-0 w-full md:w-[45%] ${isLeft ? "md:mr-auto md:mr-8" : "md:ml-auto md:ml-8"}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${phase.color}`} />
                          <CardTitle className="text-sm">{phase.label}</CardTitle>
                        </div>
                        <CardDescription>{phase.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {data.goals && data.goals.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Goals</p>
                            <ul className="space-y-1">
                              {data.goals.map((g, j) => <li key={j} className="text-sm flex gap-2">✓ {g}</li>)}
                            </ul>
                          </div>
                        )}
                        {data.courses && data.courses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Courses</p>
                            <div className="space-y-1">
                              {data.courses.map((c, j) => (
                                <div key={j} className="flex items-center gap-2">
                                  <Badge variant={c.free ? "secondary" : "outline"} className="text-xs">{c.free ? "Free" : "Paid"}</Badge>
                                  <span className="text-xs">{c.title}</span>
                                  <span className="text-xs text-muted-foreground">· {c.platform}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {data.projects && data.projects.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Projects</p>
                            {data.projects.map((p, j) => <p key={j} className="text-xs">🚀 {p}</p>)}
                          </div>
                        )}
                        {data.certifications && data.certifications.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Certifications</p>
                            {data.certifications.map((c, j) => <p key={j} className="text-xs">🏅 {c}</p>)}
                          </div>
                        )}
                        {data.expectedRole && (
                          <div className="pt-1 border-t">
                            <p className="text-xs text-muted-foreground">Expected: <span className="font-semibold text-foreground">{data.expectedRole}</span></p>
                            {data.expectedSalary && <p className="text-xs text-green-500">${data.expectedSalary.toLocaleString()}/yr</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resources */}
          {resources && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Learning Resources</CardTitle>
                <CardDescription>Curated resources to accelerate your journey</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="free">
                  <TabsList className="mb-4">
                    <TabsTrigger value="free">Free Courses</TabsTrigger>
                    <TabsTrigger value="paid">Paid Courses</TabsTrigger>
                    <TabsTrigger value="books">Books</TabsTrigger>
                    <TabsTrigger value="youtube">YouTube</TabsTrigger>
                    <TabsTrigger value="platforms">Platforms</TabsTrigger>
                  </TabsList>
                  <TabsContent value="free">
                    <div className="space-y-2">
                      {resources.freeCourses?.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
                          <BookOpen className="size-4 text-green-500 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{c.title}</p>
                            <p className="text-xs text-muted-foreground">{c.platform} · {c.topic}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Free</Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="paid">
                    <div className="space-y-2">
                      {resources.paidCourses?.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
                          <BookOpen className="size-4 text-amber-500 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{c.title}</p>
                            <p className="text-xs text-muted-foreground">{c.platform}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{c.price}</Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="books">
                    <div className="space-y-2">
                      {resources.books?.map((b, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
                          <BookOpen className="size-4 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{b.title}</p>
                            <p className="text-xs text-muted-foreground">by {b.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="youtube">
                    <div className="flex flex-wrap gap-2">
                      {resources.youtubeChannels?.map((c, i) => (
                        <Badge key={i} variant="secondary" className="gap-1.5 px-3 py-1.5">
                          📺 {c}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="platforms">
                    <div className="flex flex-wrap gap-2">
                      {resources.platforms?.map((p, i) => (
                        <Badge key={i} variant="outline" className="gap-1.5 px-3 py-1.5">
                          <ExternalLink className="size-3" />{p}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
