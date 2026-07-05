import { useState, useRef, useCallback } from "react"
import {
  Upload, FileText, User, Briefcase, GraduationCap, Code2, Trophy,
  Loader2, AlertCircle, CheckCircle2, X, FileUp
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { runResumeAgent } from "@/lib/agents"
import { extractTextFromFile } from "@/lib/fileExtract"
import type { AppState, CareerProfile } from "@/lib/types"

interface Props {
  state: AppState
  onProfileUpdate: (profile: Partial<CareerProfile>) => void
  onResultUpdate: (key: string, value: unknown) => void
}

type UploadStatus = "idle" | "extracting" | "analyzing" | "done" | "error"

export function ResumeAnalysis({ state, onProfileUpdate, onResultUpdate }: Props) {
  const [resumeText, setResumeText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Upload tab state
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const [extractedText, setExtractedText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profile = state.profile

  // ── Paste tab analyze ──────────────────────────────────────────────────────
  const handleAnalyze = async (text: string) => {
    if (!text.trim()) { setError("Please paste your resume text first."); return }
    if (!state.apiKey) { setError("Please configure your Groq API key in Settings first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runResumeAgent(text, state.apiKey)
      onResultUpdate("resume", result)
      onProfileUpdate({
        name: result.name,
        title: result.title,
        summary: result.summary,
        skills: result.skills,
        technologies: result.technologies,
        softSkills: result.softSkills,
        experience: result.experience,
        education: result.education,
        projects: result.projects,
        achievements: result.achievements,
        yearsOfExperience: result.yearsOfExperience,
        skillScore: result.skillScore,
        experienceScore: result.experienceScore,
        resumeQuality: result.resumeQuality,
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to analyze resume. Check your API key.")
    } finally {
      setLoading(false)
    }
  }

  // ── File upload helpers ────────────────────────────────────────────────────
  const ACCEPTED = [".pdf", ".docx", ".doc", ".txt", ".md"]
  const MAX_SIZE_MB = 10

  const processFile = useCallback(async (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setUploadError(`Unsupported format. Please upload: ${ACCEPTED.join(", ")}`)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File too large. Max size is ${MAX_SIZE_MB}MB.`)
      return
    }

    setUploadedFile(file)
    setUploadError("")
    setUploadStatus("extracting")
    setUploadProgress(20)

    try {
      const text = await extractTextFromFile(file)
      if (!text.trim()) throw new Error("No readable text found in file. Try a different format.")
      setExtractedText(text)
      setUploadProgress(50)

      if (!state.apiKey) {
        setUploadError("Please configure your Groq API key in Settings first.")
        setUploadStatus("error")
        return
      }

      setUploadStatus("analyzing")
      setUploadProgress(70)

      const result = await runResumeAgent(text, state.apiKey)
      onResultUpdate("resume", result)
      onProfileUpdate({
        name: result.name,
        title: result.title,
        summary: result.summary,
        skills: result.skills,
        technologies: result.technologies,
        softSkills: result.softSkills,
        experience: result.experience,
        education: result.education,
        projects: result.projects,
        achievements: result.achievements,
        yearsOfExperience: result.yearsOfExperience,
        skillScore: result.skillScore,
        experienceScore: result.experienceScore,
        resumeQuality: result.resumeQuality,
      })

      setUploadProgress(100)
      setUploadStatus("done")
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Failed to process file.")
      setUploadStatus("error")
      setUploadProgress(0)
    }
  }, [state.apiKey, onResultUpdate, onProfileUpdate])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadStatus("idle")
    setUploadProgress(0)
    setUploadError("")
    setExtractedText("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const hasResults = !!state.results.resume || !!profile.name

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Analysis</h1>
        <p className="text-muted-foreground mt-1">AI-powered resume intelligence extraction and analysis</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload"><FileUp className="size-4 mr-2" />Upload Resume</TabsTrigger>
          <TabsTrigger value="paste"><FileText className="size-4 mr-2" />Paste Resume</TabsTrigger>
          <TabsTrigger value="manual"><User className="size-4 mr-2" />Manual Input</TabsTrigger>
          {hasResults && <TabsTrigger value="results"><Trophy className="size-4 mr-2" />Analysis Results</TabsTrigger>}
        </TabsList>

        {/* ── Upload Tab ── */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="size-4" />Upload Resume File
              </CardTitle>
              <CardDescription>
                Upload your resume as PDF, DOCX, DOC, or TXT. We extract the text and analyze it with AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Error */}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {/* Drop zone — shown when idle or error */}
              {(uploadStatus === "idle" || uploadStatus === "error") && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                    transition-colors duration-200 select-none
                    ${dragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">
                        {dragOver ? "Drop your resume here" : "Drag & drop your resume"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or <span className="text-primary font-medium">click to browse</span>
                      </p>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      {["PDF", "DOCX", "DOC", "TXT"].map(f => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Max file size: {MAX_SIZE_MB}MB</p>
                  </div>
                </div>
              )}

              {/* File selected + progress */}
              {uploadedFile && uploadStatus !== "idle" && (
                <div className="space-y-4">
                  {/* File info */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {uploadStatus === "done"
                      ? <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                      : uploadStatus === "error"
                      ? <AlertCircle className="size-5 text-destructive shrink-0" />
                      : <Loader2 className="size-5 animate-spin text-primary shrink-0" />
                    }
                    {(uploadStatus === "done" || uploadStatus === "error") && (
                      <button onClick={resetUpload} className="text-muted-foreground hover:text-foreground ml-1">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  {uploadStatus !== "done" && uploadStatus !== "error" && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {uploadStatus === "extracting" && "Extracting text from file..."}
                          {uploadStatus === "analyzing" && "Analyzing with AI..."}
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Success state */}
                  {uploadStatus === "done" && (
                    <Alert className="border-green-500/30 bg-green-500/5">
                      <CheckCircle2 className="size-4 text-green-500" />
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        Resume analyzed successfully! Go to <strong>Analysis Results</strong> tab to view your profile.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Extracted text preview */}
                  {extractedText && (uploadStatus === "done" || uploadStatus === "analyzing") && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Extracted Text Preview</p>
                      <div className="rounded-lg border bg-muted/30 p-3 max-h-40 overflow-y-auto">
                        <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {extractedText.slice(0, 800)}{extractedText.length > 800 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload another */}
                  {(uploadStatus === "done" || uploadStatus === "error") && (
                    <Button variant="outline" onClick={resetUpload} className="gap-2 w-full">
                      <Upload className="size-4" />
                      Upload Another Resume
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Paste Tab ── */}
        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Upload className="size-4" />Paste Resume Text</CardTitle>
              <CardDescription>Copy and paste your complete resume content below for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Textarea
                placeholder="Paste your complete resume here — work experience, skills, education, projects, achievements..."
                className="min-h-64 font-mono text-sm resize-none"
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <Button onClick={() => handleAnalyze(resumeText)} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Brain className="size-4" />}
                  {loading ? "Analyzing..." : "Analyze Resume"}
                </Button>
                <span className="text-sm text-muted-foreground">{resumeText.length} characters</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Manual Tab ── */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Professional Profile</CardTitle>
              <CardDescription>Enter your career details manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile.name} onChange={e => onProfileUpdate({ name: e.target.value })} placeholder="Alex Chen" />
                </div>
                <div className="space-y-2">
                  <Label>Current/Target Title</Label>
                  <Input value={profile.title ?? ""} onChange={e => onProfileUpdate({ title: e.target.value })} placeholder="Senior Developer" />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input type="number" value={profile.yearsOfExperience} onChange={e => onProfileUpdate({ yearsOfExperience: Number(e.target.value) })} placeholder="3" />
                </div>
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Input value={profile.targetRole} onChange={e => onProfileUpdate({ targetRole: e.target.value })} placeholder="AI/ML Engineer" />
                </div>
                <div className="space-y-2">
                  <Label>Target Salary</Label>
                  <Input value={profile.targetSalary} onChange={e => onProfileUpdate({ targetSalary: e.target.value })} placeholder="$150,000" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Country</Label>
                  <Input value={profile.preferredCountry} onChange={e => onProfileUpdate({ preferredCountry: e.target.value })} placeholder="United States" />
                </div>
                <div className="space-y-2">
                  <Label>Target Industry</Label>
                  <Input value={profile.targetIndustry} onChange={e => onProfileUpdate({ targetIndustry: e.target.value })} placeholder="Technology" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Professional Summary</Label>
                <Textarea value={profile.summary ?? ""} onChange={e => onProfileUpdate({ summary: e.target.value })} placeholder="Brief professional summary..." className="resize-none" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Textarea value={profile.skills.join(", ")} onChange={e => onProfileUpdate({ skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="JavaScript, Python, React, Node.js..." className="resize-none" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Technologies (comma separated)</Label>
                <Textarea value={profile.technologies.join(", ")} onChange={e => onProfileUpdate({ technologies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="React, PostgreSQL, Docker, AWS..." className="resize-none" rows={2} />
              </div>
              <Button onClick={() => {}} className="gap-2">Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Results Tab ── */}
        {hasResults && (
          <TabsContent value="results" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><User className="size-4" />Candidate Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold text-lg">{profile.name}</p>
                  <p className="text-muted-foreground text-sm">{profile.title}</p>
                  <p className="text-sm mt-2 leading-relaxed">{profile.summary}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary">{profile.yearsOfExperience} yrs exp</Badge>
                    <Badge variant="secondary">{profile.skills?.length ?? 0} skills</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Code2 className="size-4" />Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills?.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                  <Separator className="my-3" />
                  <p className="text-xs font-medium text-muted-foreground mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.technologies?.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="size-4" />Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.experience?.map((exp, i) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-3">
                      <p className="font-medium text-sm">{exp.role}</p>
                      <p className="text-muted-foreground text-xs">{exp.company} · {exp.duration}</p>
                      <ul className="mt-1 space-y-0.5">
                        {exp.highlights?.slice(0, 2).map((h, j) => <li key={j} className="text-xs text-muted-foreground">• {h}</li>)}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="size-4" />Education & Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.education?.map((edu, i) => (
                    <div key={i} className="border-l-2 border-blue-500/30 pl-3">
                      <p className="font-medium text-sm">{edu.degree}</p>
                      <p className="text-muted-foreground text-xs">{edu.institution} · {edu.year}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-1">
                    {profile.achievements?.map((a, i) => (
                      <p key={i} className="text-xs text-muted-foreground">🏆 {a}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function Brain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  )
}
