import { useState } from "react"
import { CheckCircle2, Eye, EyeOff, Key, Palette, Play, RotateCcw, Settings2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "@/components/theme-provider"
import { demoProfile, demoResults } from "@/lib/demo"
import type { AppState, CareerProfile, AgentResults } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  state: AppState
  onApiKeyChange: (key: string) => void
  onModelChange: (model: string) => void
  onLoadDemo: (profile: CareerProfile, results: AgentResults) => void
  onReset: () => void
}

export function Settings({ state, onApiKeyChange, onModelChange, onLoadDemo, onReset }: Props) {
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle")
  const { theme, setTheme } = useTheme()

  const testApiKey = async () => {
    if (!state.apiKey) return
    setTestStatus("testing")
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${state.apiKey}` },
      })
      setTestStatus(res.ok ? "ok" : "fail")
    } catch {
      setTestStatus("fail")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your CareerDNA AI operating system</p>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Key className="size-4" />Groq API Configuration</CardTitle>
          <CardDescription>Required to run AI agents. Get your free key at console.groq.com</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Groq API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={state.apiKey}
                  onChange={e => onApiKeyChange(e.target.value)}
                  placeholder="gsk_..."
                  className="pr-10"
                />
                <button
                  onClick={() => setShowKey(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button variant="outline" onClick={testApiKey} disabled={!state.apiKey || testStatus === "testing"} className="gap-2">
                <Play className="size-3" />
                Test
              </Button>
            </div>
            {testStatus === "ok" && (
              <Alert>
                <CheckCircle2 className="size-4 text-green-500" />
                <AlertDescription className="text-green-600">API key is valid and working!</AlertDescription>
              </Alert>
            )}
            {testStatus === "fail" && (
              <Alert variant="destructive">
                <AlertDescription>API key validation failed. Check the key and try again.</AlertDescription>
              </Alert>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally in your browser and never sent to any server other than Groq's API.
          </p>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Palette className="size-4" />Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map(t => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Settings2 className="size-4" />Demo Mode</CardTitle>
          <CardDescription>Load a pre-populated profile with sample AI results to explore the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">Demo Profile: Alex Chen</p>
            <p className="text-xs text-muted-foreground">Full Stack Developer → AI/ML Engineer | 3 years experience</p>
            <div className="flex gap-1.5 mt-2">
              <Badge variant="secondary" className="text-xs">JavaScript</Badge>
              <Badge variant="secondary" className="text-xs">React</Badge>
              <Badge variant="secondary" className="text-xs">Python</Badge>
              <Badge variant="outline" className="text-xs">+7 more</Badge>
            </div>
          </div>
          <Button onClick={() => onLoadDemo(demoProfile, demoResults)} className="gap-2 w-full">
            <Play className="size-4" />
            Load Demo Mode
          </Button>
        </CardContent>
      </Card>

      {/* AI Model Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Model Configuration</CardTitle>
          <CardDescription>Select the active LLM to power your AI career agents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Active Model</Label>
            <Select value={state.model} onValueChange={onModelChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama-3.1-8b-instant">
                  Llama 3.1 8B Instant (Fast, High limits)
                </SelectItem>
                <SelectItem value="llama-3.3-70b-versatile">
                  Llama 3.3 70B Versatile (High reasoning, Low limits)
                </SelectItem>
                <SelectItem value="mixtral-8x7b-32768">
                  Mixtral 8x7B 32k (Balanced)
                </SelectItem>
                <SelectItem value="gemma2-9b-it">
                  Gemma 2 9B IT (Fast reasoning)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs mt-1">
              {state.model === "llama-3.3-70b-versatile" ? (
                <span className="text-amber-500 font-medium">
                  ⚠️ Caution: This model has low daily token limits (100k TPD) on free tiers and is prone to rate limits during resume processing.
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Recommended: High rate limits and extremely fast responses.
                </span>
              )}
            </p>
          </div>
          
          <Separator />

          <div className="space-y-2 text-sm pt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider</span>
              <Badge variant="outline">Groq</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Context Window</span>
              <span className="font-medium">8,192 tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Agents</span>
              <span className="font-medium">8 agents</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions — proceed with caution</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" />
            Reset All Data
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Clears all profile data, AI results, and progress tracking</p>
        </CardContent>
      </Card>
    </div>
  )
}
