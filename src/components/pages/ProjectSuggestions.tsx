import { useState } from "react"
import { AlertCircle, Clock, Code2, Loader2, Rocket, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { runProjectGeneratorAgent } from "@/lib/agents"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onResultUpdate: (key: string, value: unknown) => void
}

interface Project {
  name: string
  description: string
  difficulty: string
  techStack: string[]
  skills: string[]
  estimatedTime: string
  resumeImpact: string
  githubValue: string
  keyFeatures: string[]
  why: string
}

const difficultyStyles: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-200",
  intermediate: "bg-amber-500/10 text-amber-600 border-amber-200",
  advanced: "bg-red-500/10 text-red-600 border-red-200",
}

const impactStars: Record<string, number> = { low: 1, medium: 2, high: 3 }

export function ProjectSuggestions({ state, onResultUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const projects = state.results.projects as Project[] | undefined

  const handleGenerate = async () => {
    if (!state.apiKey) { setError("Configure Groq API key in Settings first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runProjectGeneratorAgent(state.profile, state.apiKey)
      onResultUpdate("projects", result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate project suggestions.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Skill Analyzer</h1>
          <p className="text-muted-foreground mt-1">Portfolio projects designed to maximize your career impact</p>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
          {loading ? "Generating..." : "Generate Projects"}
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {!projects && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Code2 className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Generate portfolio project ideas tailored to your skills and target role</p>
          </CardContent>
        </Card>
      )}

      {projects && (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <CardDescription className="mt-1">{project.description}</CardDescription>
                  </div>
                  <Badge className={`capitalize text-xs shrink-0 border ${difficultyStyles[project.difficulty] ?? ""}`}>
                    {project.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{project.estimatedTime}</span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {project.techStack?.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                </div>

                {project.keyFeatures?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Key Features</p>
                    <ul className="space-y-0.5">
                      {project.keyFeatures.slice(0, 3).map((f, j) => (
                        <li key={j} className="text-xs text-muted-foreground">• {f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.why && (
                  <div className="bg-muted/50 rounded-md p-2.5">
                    <p className="text-xs text-muted-foreground">💡 {project.why}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-1 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Resume Impact</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Star key={j} className={`size-3 ${j < (impactStars[project.resumeImpact] ?? 1) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">GitHub Value</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Star key={j} className={`size-3 ${j < (impactStars[project.githubValue] ?? 1) ? "text-blue-500 fill-blue-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
