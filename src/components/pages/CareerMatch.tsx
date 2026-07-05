import { useState } from "react"
import { AlertCircle, Loader2, Target, TrendingUp, Globe, DollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { runCareerAdvisorAgent } from "@/lib/agents"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onResultUpdate: (key: string, value: unknown) => void
}

export function CareerMatch({ state, onResultUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  type CareerAdvice = {
    bestCareerPath?: { title: string; reason: string; salaryMin: number; salaryMax: number; growthRate: string }
    alternativeCareerPaths?: Array<{ title: string; reason: string; salaryMin: number; salaryMax: number; fitScore: number }>
    salaryEstimate?: { min: number; max: number; median: number; currency: string }
    futureTrends?: string[]
    industryDemand?: string
    remotePossibility?: string
    timeToGoal?: string
    motivationalMessage?: string
  }
  const advice = state.results.careerAdvice as CareerAdvice | undefined

  const handleAnalyze = async () => {
    if (!state.apiKey) { setError("Configure Groq API key in Settings first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runCareerAdvisorAgent(state.profile, state.apiKey)
      onResultUpdate("careerAdvice", result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed.")
    } finally {
      setLoading(false)
    }
  }

  const best = advice?.bestCareerPath
  const alts = advice?.alternativeCareerPaths
  const salary = advice?.salaryEstimate
  const trends = advice?.futureTrends

  const demandColor = (d: string | undefined) => d === "high" ? "text-green-500" : d === "medium" ? "text-amber-500" : "text-red-500"

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Match</h1>
          <p className="text-muted-foreground mt-1">AI career advisor — best paths, salary insights, and market intelligence</p>
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
          {loading ? "Analyzing..." : "Get Advice"}
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {!advice && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Target className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Get personalized career path analysis from your AI advisor</p>
          </CardContent>
        </Card>
      )}

      {advice && (
        <div className="space-y-6">
          {/* Motivational Banner */}
          {advice.motivationalMessage && (
            <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-violet-500/20">
              <CardContent className="pt-5 pb-5">
                <p className="text-sm leading-relaxed italic">"{advice.motivationalMessage}"</p>
              </CardContent>
            </Card>
          )}

          {/* Best Career Path */}
          {best && (
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Best Match</Badge>
                  <CardTitle className="text-xl">{best.title}</CardTitle>
                </div>
                <CardDescription>{best.reason}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <DollarSign className="size-5 mx-auto text-green-500 mb-1" />
                    <p className="text-lg font-bold">${(best.salaryMin as number).toLocaleString()} – ${(best.salaryMax as number).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Salary Range</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="size-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-lg font-bold">{best.growthRate}</p>
                    <p className="text-xs text-muted-foreground">Growth Rate</p>
                  </div>
                  <div className="text-center">
                    <Clock className="size-5 mx-auto text-violet-500 mb-1" />
                    <p className="text-lg font-bold">{advice.timeToGoal}</p>
                    <p className="text-xs text-muted-foreground">Time to Goal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Intelligence */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground font-medium mb-1">Industry Demand</p>
                <p className={`text-2xl font-bold capitalize ${demandColor(advice.industryDemand)}`}>{advice.industryDemand}</p>
                <p className="text-xs text-muted-foreground mt-1">Market demand level</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <Globe className="size-4 text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground font-medium mb-1">Remote Possibility</p>
                <p className={`text-2xl font-bold capitalize ${demandColor(advice.remotePossibility)}`}>{advice.remotePossibility}</p>
              </CardContent>
            </Card>
            {salary && (
              <Card>
                <CardContent className="pt-5">
                  <DollarSign className="size-4 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground font-medium mb-1">Median Salary</p>
                  <p className="text-2xl font-bold">${salary.median.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{salary.currency}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Alternative Paths */}
          {alts && alts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alternative Career Paths</CardTitle>
                <CardDescription>Other roles that match your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alts.map((path, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{path.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{path.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">${path.salaryMin.toLocaleString()} – ${path.salaryMax.toLocaleString()}/yr</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{path.fitScore}%</p>
                      <p className="text-xs text-muted-foreground">Fit Score</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Future Trends */}
          {trends && trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Future Industry Trends</CardTitle>
                <CardDescription>Skills and technologies that will dominate the next 2-3 years</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trends.map((t, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
