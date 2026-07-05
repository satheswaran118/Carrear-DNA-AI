import { useState } from "react"
import {
  AlertCircle, Loader2, Mic, Brain, Users, Building2,
  Code2, Server, ChevronDown, ChevronUp, Sparkles,
  CheckCircle2, BookOpen, Lightbulb, RefreshCw, Zap,
  Trophy, Target, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { runInterviewMentorAgent } from "@/lib/agents"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onResultUpdate: (key: string, value: unknown) => void
}

type TechnicalQ  = { question: string; answer: string; hint: string; difficulty: string; category?: string }
type BehavioralQ = { question: string; answer: string; framework: string; tip: string }
type HrQ         = { question: string; answer: string; bestAnswer: string }
type CodingTopic = { topic: string; question: string; answer: string; examples: string[]; difficulty: string }
type SystemDesign = { topic: string; question: string; answer: string; keyPoints: string[] }
type InterviewResult = {
  technical?: TechnicalQ[]
  behavioral?: BehavioralQ[]
  hr?: HrQ[]
  coding?: CodingTopic[]
  systemDesign?: SystemDesign[]
  confidenceScore?: number
  preparationAdvice?: string
}

type TabId = "technical" | "behavioral" | "hr" | "coding" | "design"

const TABS: { id: TabId; label: string; icon: React.ElementType; gradient: string; textColor: string; borderColor: string; bgLight: string }[] = [
  { id: "technical",  label: "Technical",     icon: Brain,      gradient: "from-blue-500 to-indigo-600",    textColor: "text-blue-600",   borderColor: "border-blue-400",   bgLight: "bg-blue-50 dark:bg-blue-950/40"   },
  { id: "behavioral", label: "Behavioral",    icon: Users,      gradient: "from-purple-500 to-violet-600",  textColor: "text-purple-600", borderColor: "border-purple-400", bgLight: "bg-purple-50 dark:bg-purple-950/40" },
  { id: "hr",         label: "HR Round",      icon: Building2,  gradient: "from-emerald-500 to-teal-600",   textColor: "text-emerald-600",borderColor: "border-emerald-400",bgLight: "bg-emerald-50 dark:bg-emerald-950/40"},
  { id: "coding",     label: "Coding",        icon: Code2,      gradient: "from-orange-500 to-amber-500",   textColor: "text-orange-600", borderColor: "border-orange-400", bgLight: "bg-orange-50 dark:bg-orange-950/40" },
  { id: "design",     label: "System Design", icon: Server,     gradient: "from-rose-500 to-pink-600",      textColor: "text-rose-600",   borderColor: "border-rose-400",   bgLight: "bg-rose-50 dark:bg-rose-950/40"    },
]

const DIFF: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  easy:   { label: "Easy",   bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  medium: { label: "Medium", bg: "bg-amber-100 dark:bg-amber-900/40",     text: "text-amber-700 dark:text-amber-300",     dot: "bg-amber-500"   },
  hard:   { label: "Hard",   bg: "bg-red-100 dark:bg-red-900/40",         text: "text-red-700 dark:text-red-300",         dot: "bg-red-500"     },
}

function DiffPill({ level }: { level: string }) {
  const d = DIFF[level?.toLowerCase()] ?? DIFF.medium
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${d.bg} ${d.text}`}>
      <span className={`size-1.5 rounded-full ${d.dot}`} />
      {d.label}
    </span>
  )
}

function QACard({ index, question, answer, meta, gradient, bgLight, borderColor, answerLabel = "Model Answer" }: {
  index: number; question: string; answer: string; meta?: React.ReactNode
  gradient: string; bgLight: string; borderColor: string; answerLabel?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`
      rounded-2xl border-2 overflow-hidden transition-all duration-300
      ${open ? `${borderColor} shadow-lg` : "border-border hover:border-opacity-60 hover:shadow-md"}
    `}>
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4 bg-card hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {/* Numbered badge */}
        <span className={`shrink-0 size-7 rounded-full bg-gradient-to-br ${gradient} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-medium leading-relaxed">{question}</p>
        <div className="flex items-center gap-2 shrink-0">
          {meta}
          <span className="text-muted-foreground">
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </span>
        </div>
      </button>

      {open && (
        <div className={`${bgLight} border-t-2 ${borderColor} px-5 py-4`}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {answerLabel}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap pl-6">{answer}</p>
        </div>
      )}
    </div>
  )
}

export function InterviewPrep({ state, onResultUpdate }: Props) {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [activeTab, setActiveTab] = useState<TabId>("technical")
  const interview = state.results.interview as InterviewResult | undefined

  const handleGenerate = async () => {
    if (!state.apiKey) { setError("Configure Groq API key in Settings first."); return }
    setError(""); setLoading(true)
    try {
      const result = await runInterviewMentorAgent(state.profile, state.apiKey)
      onResultUpdate("interview", result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate questions.")
    } finally {
      setLoading(false)
    }
  }

  const score = interview?.confidenceScore ?? 0
  const currentTab = TABS.find(t => t.id === activeTab)!

  const tabContent: Record<TabId, React.ReactNode> = {
    technical: (
      <div className="space-y-3">
        {interview?.technical?.map((q, i) => (
          <QACard key={i} index={i} question={q.question}
            answer={q.answer || q.hint || "Review this concept thoroughly."}
            answerLabel="Full Answer"
            gradient={currentTab.gradient} bgLight={currentTab.bgLight} borderColor={currentTab.borderColor}
            meta={
              <div className="flex items-center gap-1.5">
                {q.category && <span className="hidden sm:block text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">{q.category}</span>}
                <DiffPill level={q.difficulty} />
              </div>
            }
          />
        ))}
      </div>
    ),
    behavioral: (
      <div className="space-y-3">
        {interview?.behavioral?.map((q, i) => (
          <QACard key={i} index={i} question={q.question}
            answer={q.answer || q.tip || "Use the STAR framework to structure your answer."}
            answerLabel="STAR Answer"
            gradient={currentTab.gradient} bgLight={currentTab.bgLight} borderColor={currentTab.borderColor}
            meta={
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                {q.framework}
              </span>
            }
          />
        ))}
      </div>
    ),
    hr: (
      <div className="space-y-3">
        {interview?.hr?.map((q, i) => (
          <QACard key={i} index={i} question={q.question}
            answer={q.answer || q.bestAnswer || "Be honest and confident."}
            answerLabel="Suggested Answer"
            gradient={currentTab.gradient} bgLight={currentTab.bgLight} borderColor={currentTab.borderColor}
          />
        ))}
      </div>
    ),
    coding: (
      <div className="space-y-4">
        {interview?.coding?.map((topic, i) => (
          <div key={i} className="rounded-2xl border-2 border-border overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className={`px-5 py-3 bg-gradient-to-r ${currentTab.gradient} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-white" />
                <span className="text-sm font-bold text-white">{topic.topic}</span>
              </div>
              <DiffPill level={topic.difficulty} />
            </div>
            <div className="px-5 py-4 bg-card space-y-4">
              {topic.question && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Question</p>
                  <p className="text-sm font-medium">{topic.question}</p>
                </div>
              )}
              {topic.answer && (
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="size-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">Approach & Solution</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{topic.answer}</p>
                </div>
              )}
              {topic.examples?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Examples</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.examples.map((ex, j) => (
                      <span key={j} className="font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{ex}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
    design: (
      <div className="space-y-4">
        {interview?.systemDesign?.map((topic, i) => (
          <div key={i} className="rounded-2xl border-2 border-border overflow-hidden hover:border-rose-300 hover:shadow-lg transition-all duration-300">
            <div className={`px-5 py-3 bg-gradient-to-r ${currentTab.gradient} flex items-center gap-2`}>
              <Server className="size-4 text-white" />
              <span className="text-sm font-bold text-white">{topic.topic}</span>
            </div>
            <div className="px-5 py-4 bg-card space-y-4">
              {topic.question && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Design Problem</p>
                  <p className="text-sm font-medium">{topic.question}</p>
                </div>
              )}
              {topic.answer && (
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="size-3.5 text-rose-500" />
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Architecture Answer</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{topic.answer}</p>
                </div>
              )}
              {topic.keyPoints?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Key Points</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.keyPoints.map((kp, j) => (
                      <span key={j} className="text-xs px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">{kp}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  }

  const tabCount: Record<TabId, number> = {
    technical:  interview?.technical?.length  ?? 0,
    behavioral: interview?.behavioral?.length ?? 0,
    hr:         interview?.hr?.length         ?? 0,
    coding:     interview?.coding?.length     ?? 0,
    design:     interview?.systemDesign?.length ?? 0,
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 size-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="size-5 text-yellow-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">AI-Powered</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Interview Prep</h1>
            <p className="text-white/70 mt-1 text-sm">
              Personalized questions with full answers for <span className="text-white font-semibold">{state.profile.targetRole || "your target role"}</span>
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-white text-indigo-700 hover:bg-white/90 font-bold gap-2 shadow-lg px-6"
            size="lg"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : interview ? <RefreshCw className="size-4" /> : <Sparkles className="size-4" />}
            {loading ? "Generating..." : interview ? "Regenerate" : "Generate Questions"}
          </Button>
        </div>

        {/* Score strip — only when results exist */}
        {interview && (
          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TABS.map(tab => (
              <div key={tab.id} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
                <tab.icon className="size-5 mx-auto mb-1 text-white" />
                <p className="text-2xl font-extrabold">{tabCount[tab.id]}</p>
                <p className="text-xs text-white/70">{tab.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Empty state ── */}
      {!interview && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-16 text-center">
          <div className="size-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Mic className="size-9 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to ace your interview?</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Get AI-generated questions with complete, personalized answers based on your resume and target role.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            {["Technical Q&A", "STAR Answers", "Coding Topics", "System Design", "HR Questions"].map(f => (
              <span key={f} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border shadow-sm">
                <Star className="size-3 text-yellow-500" /> {f}
              </span>
            ))}
          </div>
          <Button onClick={handleGenerate} size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 gap-2 px-8 shadow-lg hover:shadow-xl transition-shadow">
            <Sparkles className="size-4" /> Generate My Interview Prep
          </Button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse mb-4">
            <Loader2 className="size-4 animate-spin text-purple-500" />
            <span className="text-sm">AI is crafting personalized questions and answers...</span>
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-2xl border-2 border-border p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="size-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3 bg-muted rounded-full w-4/5" />
                  <div className="h-3 bg-muted rounded-full w-3/5" />
                </div>
                <div className="h-5 w-14 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {interview && !loading && (
        <div className="space-y-6">

          {/* Readiness + Advice */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Score card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg flex items-center gap-4">
              <div className="relative size-20 shrink-0">
                <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold">{score}%</span>
                </div>
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">Readiness</p>
                <p className="text-xl font-bold mt-0.5">
                  {score >= 75 ? "Well Prepared!" : score >= 50 ? "On Track" : "Keep Practicing"}
                </p>
                <p className="text-white/60 text-xs mt-1">Interview confidence score</p>
              </div>
            </div>

            {/* Advice card */}
            {interview.preparationAdvice && (
              <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-xl bg-amber-400 flex items-center justify-center">
                    <Lightbulb className="size-4 text-white" />
                  </div>
                  <span className="font-bold text-amber-700 dark:text-amber-400">AI Coach Advice</span>
                </div>
                <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">{interview.preparationAdvice}</p>
              </div>
            )}
          </div>

          {/* Trophy row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  rounded-2xl p-4 text-center border-2 transition-all duration-200 cursor-pointer
                  ${activeTab === tab.id
                    ? `bg-gradient-to-br ${tab.gradient} text-white border-transparent shadow-lg scale-105`
                    : "bg-card border-border hover:border-opacity-60 hover:shadow-md"
                  }
                `}
              >
                <tab.icon className={`size-5 mx-auto mb-1.5 ${activeTab === tab.id ? "text-white" : tab.textColor}`} />
                <p className={`text-2xl font-extrabold ${activeTab === tab.id ? "text-white" : ""}`}>{tabCount[tab.id]}</p>
                <p className={`text-xs font-medium ${activeTab === tab.id ? "text-white/80" : "text-muted-foreground"}`}>{tab.label}</p>
              </button>
            ))}
          </div>

          {/* Active tab section */}
          <div className="space-y-4">
            {/* Section header */}
            <div className={`flex items-center justify-between rounded-2xl bg-gradient-to-r ${currentTab.gradient} px-6 py-4 text-white shadow-md`}>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <currentTab.icon className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{currentTab.label} Questions</h2>
                  <p className="text-white/70 text-xs">{tabCount[activeTab]} questions · Click to reveal answers</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="size-4 text-yellow-300" />
                <span className="font-bold">{tabCount[activeTab]}</span>
              </div>
            </div>

            {/* Questions */}
            {tabContent[activeTab]}

            {tabCount[activeTab] === 0 && (
              <div className="rounded-2xl border-2 border-dashed p-12 text-center">
                <Target className="size-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">No {currentTab.label.toLowerCase()} questions generated yet.</p>
                <p className="text-muted-foreground text-xs mt-1">Try regenerating with a more complete profile.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
