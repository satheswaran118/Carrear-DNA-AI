import { useState } from "react"
import { CheckCircle2, Circle, Plus, Trash2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import type { AppState } from "@/lib/types"

interface Props {
  state: AppState
  onToggleCompleted: (type: "courses" | "projects" | "skills", item: string) => void
  onWeeklyProgressChange: (value: number) => void
}

function TrackingList({
  title,
  items,
  completed,
  emptyMsg,
  onToggle,
}: {
  title: string
  items: string[]
  completed: string[]
  emptyMsg: string
  onToggle: (item: string) => void
}) {
  const [newItem, setNewItem] = useState("")
  const [localItems, setLocalItems] = useState<string[]>([])

  const allItems = [...items, ...localItems]
  const done = allItems.filter(i => completed.includes(i))

  const addItem = () => {
    if (!newItem.trim()) return
    setLocalItems(prev => [...prev, newItem.trim()])
    setNewItem("")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">{done.length}/{allItems.length} completed</CardDescription>
          </div>
          <Progress value={allItems.length ? (done.length / allItems.length) * 100 : 0} className="w-20 h-1.5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {allItems.length === 0 && <p className="text-xs text-muted-foreground italic">{emptyMsg}</p>}
        {allItems.map(item => (
          <div key={item} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group">
            <button onClick={() => onToggle(item)} className="shrink-0">
              {completed.includes(item)
                ? <CheckCircle2 className="size-4 text-green-500" />
                : <Circle className="size-4 text-muted-foreground/40" />}
            </button>
            <span className={`text-sm flex-1 ${completed.includes(item) ? "line-through text-muted-foreground" : ""}`}>{item}</span>
            {localItems.includes(item) && (
              <button onClick={() => setLocalItems(prev => prev.filter(i => i !== item))} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder={`Add ${title.toLowerCase()}...`}
            className="h-7 text-xs"
          />
          <Button size="sm" variant="outline" onClick={addItem} className="h-7 px-2">
            <Plus className="size-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProgressTracker({ state, onToggleCompleted, onWeeklyProgressChange }: Props) {
  const courses = (state.results.learningPlan as Record<string, unknown> | undefined)
    ? Object.values(state.results.learningPlan!).flatMap((phase: unknown) => {
        if (typeof phase === "object" && phase !== null && "courses" in phase) {
          return ((phase as { courses: Array<{title: string}> }).courses ?? []).map(c => c.title)
        }
        return []
      })
    : []

  const projects = ((state.results.projects ?? []) as Array<{ name: string }>).map(p => p.name)

  const missingSkills = (state.results.skillGap?.missingSkills ?? []).map(s => s.skill)

  const totalDone = state.completedCourses.length + state.completedProjects.length + state.completedSkills.length
  const total = courses.length + projects.length + missingSkills.length
  const overallProgress = total > 0 ? Math.round((totalDone / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress and mark completed milestones</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Courses Done", value: state.completedCourses.length, total: courses.length, color: "text-violet-500" },
          { label: "Projects Built", value: state.completedProjects.length, total: projects.length, color: "text-blue-500" },
          { label: "Skills Acquired", value: state.completedSkills.length, total: missingSkills.length, color: "text-green-500" },
          { label: "Overall Progress", value: overallProgress, total: 100, color: "text-amber-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}{s.label === "Overall Progress" ? "%" : ""}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              {s.label !== "Overall Progress" && s.total > 0 && (
                <p className="text-xs text-muted-foreground">of {s.total} total</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <span className="font-medium text-sm">Career Transformation Progress</span>
            </div>
            <Badge variant="secondary">{overallProgress}% complete</Badge>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">{totalDone} of {total} total milestones achieved</p>
        </CardContent>
      </Card>

      {/* Weekly Progress Slider */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Weekly Goal Progress</CardTitle>
          <CardDescription>How much of this week's goal have you completed?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[state.weeklyProgress]}
              onValueChange={([v]) => onWeeklyProgressChange(v)}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-lg font-bold w-12 text-right">{state.weeklyProgress}%</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Tracking Lists */}
      <div className="grid md:grid-cols-3 gap-4">
        <TrackingList
          title="Courses"
          items={courses}
          completed={state.completedCourses}
          emptyMsg="Generate a learning roadmap to see courses here"
          onToggle={item => onToggleCompleted("courses", item)}
        />
        <TrackingList
          title="Projects"
          items={projects}
          completed={state.completedProjects}
          emptyMsg="Generate project suggestions to see projects here"
          onToggle={item => onToggleCompleted("projects", item)}
        />
        <TrackingList
          title="Skills"
          items={missingSkills}
          completed={state.completedSkills}
          emptyMsg="Run skill gap analysis to see skills here"
          onToggle={item => onToggleCompleted("skills", item)}
        />
      </div>
    </div>
  )
}
