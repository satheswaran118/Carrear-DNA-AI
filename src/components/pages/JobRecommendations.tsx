import { useState } from "react"
import { AlertCircle, Building2, CheckCircle2, Loader2, XCircle, Briefcase, Globe, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { runJobMatcherAgent } from "@/lib/agents"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onResultUpdate: (key: string, value: unknown) => void
}

interface Job {
  company: string
  role: string
  matchScore: number
  reason: string
  salaryMin: number
  salaryMax: number
  requiredSkills: string[]
  missingSkills: string[]
  preparationTime: string
  remote: boolean
  companyType: string
  industry: string
}

export function JobRecommendations({ state, onResultUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const jobs = state.results.jobs as Job[] | undefined

  const handleFetch = async () => {
    if (!state.apiKey) { setError("Configure Groq API key in Settings first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runJobMatcherAgent(state.profile, state.apiKey)
      onResultUpdate("jobs", result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch recommendations.")
    } finally {
      setLoading(false)
    }
  }

  const matchColor = (score: number) =>
    score >= 75 ? "text-green-500" : score >= 55 ? "text-amber-500" : "text-red-500"

  const typeColors: Record<string, string> = {
    startup: "bg-violet-500/10 text-violet-600 border-violet-200",
    mid: "bg-blue-500/10 text-blue-600 border-blue-200",
    enterprise: "bg-slate-500/10 text-slate-600 border-slate-200",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Recommendations</h1>
          <p className="text-muted-foreground mt-1">AI-matched companies and roles based on your unique profile</p>
        </div>
        <Button onClick={handleFetch} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Briefcase className="size-4" />}
          {loading ? "Matching..." : "Find Jobs"}
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {!jobs && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Building2 className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Find your perfect job matches with AI-powered matching</p>
          </CardContent>
        </Card>
      )}

      {jobs && jobs.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{job.company}</CardTitle>
                    <CardDescription className="font-medium text-foreground/80">{job.role}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${matchColor(job.matchScore)}`}>{job.matchScore}%</p>
                    <p className="text-xs text-muted-foreground">match</p>
                  </div>
                </div>
                <Progress value={job.matchScore} className="h-1.5 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{job.reason}</p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={`text-xs capitalize ${typeColors[job.companyType] ?? ""}`}>
                    {job.companyType}
                  </Badge>
                  {job.remote && <Badge variant="secondary" className="text-xs gap-1"><Globe className="size-3" />Remote</Badge>}
                  <Badge variant="outline" className="text-xs">{job.industry}</Badge>
                </div>

                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="size-3.5 text-green-500" />
                  <span className="font-medium">${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}</span>
                  <span className="text-muted-foreground">/yr</span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills?.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs gap-1">
                        {(state.profile.skills ?? []).includes(s)
                          ? <CheckCircle2 className="size-2.5 text-green-500" />
                          : <XCircle className="size-2.5 text-red-400" />}
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {job.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Gaps to Fill</p>
                    <div className="flex flex-wrap gap-1">
                      {job.missingSkills.map(s => <Badge key={s} variant="destructive" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}

                <div className="pt-1 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Prep time needed</span>
                  <span className="text-xs font-medium">{job.preparationTime}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
