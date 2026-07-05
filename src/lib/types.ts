export interface CareerProfile {
  name: string
  title?: string
  summary?: string
  skills: string[]
  technologies: string[]
  softSkills?: string[]
  experience?: Array<{ company: string; role: string; duration: string; highlights: string[] }>
  education?: Array<{ degree: string; institution: string; year: string }>
  projects?: Array<{ name: string; description: string; technologies: string[] }>
  achievements?: string[]
  yearsOfExperience: number
  targetRole: string
  targetSalary: string
  preferredCountry: string
  targetIndustry: string
  skillScore?: number
  experienceScore?: number
  resumeQuality?: number
}

export interface AgentResults {
  resume?: Record<string, unknown>
  skillGap?: {
    targetRole?: string
    currentSkills?: Array<{ skill: string; level: number; category: string }>
    missingSkills?: Array<{ skill: string; priority: string; difficulty: string; timeToLearn: string }>
    weakAreas?: string[]
    strengthAreas?: string[]
    overallReadiness?: number
    aiReadiness?: number
    interviewReadiness?: number
    portfolioStrength?: number
    careerHealth?: number
  }
  careerAdvice?: Record<string, unknown>
  learningPlan?: Record<string, unknown>
  projects?: unknown[]
  interview?: Record<string, unknown>
  jobs?: unknown[]
  coaching?: Record<string, unknown>
}

export type PageId =
  | "dashboard"
  | "resume"
  | "skills"
  | "career"
  | "roadmap"
  | "jobs"
  | "gap"
  | "interview"
  | "planner"
  | "progress"
  | "settings"

export interface AppState {
  apiKey: string
  model: string
  profile: CareerProfile
  results: AgentResults
  loading: Record<string, boolean>
  errors: Record<string, string>
  completedCourses: string[]
  completedProjects: string[]
  completedSkills: string[]
  weeklyProgress: number
}
