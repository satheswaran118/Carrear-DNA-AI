import { callGroq, parseJSON, type Message } from "./groq"
import type { CareerProfile, AgentResults } from "./types"

function systemMsg(content: string): Message {
  return { role: "system", content }
}
function userMsg(content: string): Message {
  return { role: "user", content }
}

// ─── Agent 1: Resume Intelligence ───────────────────────────────────────────
export async function runResumeAgent(resumeText: string, apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are an elite Resume Intelligence Agent. Your job is to deeply analyze professional resumes and extract structured career intelligence. Be thorough, precise, and professional. Always respond with valid JSON.`),
    userMsg(`Analyze this resume and extract a comprehensive profile. Return ONLY a JSON object with these exact keys:
{
  "name": "Full Name",
  "title": "Current/Target Title",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", ...],
  "technologies": ["tech1", "tech2", ...],
  "softSkills": ["skill1", ...],
  "experience": [{"company": "", "role": "", "duration": "", "highlights": [""]}],
  "education": [{"degree": "", "institution": "", "year": ""}],
  "projects": [{"name": "", "description": "", "technologies": [""]}],
  "achievements": ["achievement1", ...],
  "yearsOfExperience": 0,
  "skillScore": 0,
  "experienceScore": 0,
  "resumeQuality": 0
}

Resume:
${resumeText}`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON(raw, {
    name: "Unknown",
    title: "Professional",
    summary: "",
    skills: [],
    technologies: [],
    softSkills: [],
    experience: [],
    education: [],
    projects: [],
    achievements: [],
    yearsOfExperience: 0,
    skillScore: 60,
    experienceScore: 60,
    resumeQuality: 60,
  })
}

// ─── Agent 2: Skill Gap ──────────────────────────────────────────────────────
export async function runSkillGapAgent(profile: CareerProfile, apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are an expert Skill Gap Analysis Agent. You identify precisely what skills a professional needs to reach their target role and provide actionable insights. Always respond with valid JSON.`),
    userMsg(`Analyze the skill gap for this professional and return ONLY a JSON object:
{
  "targetRole": "string",
  "currentSkills": [{"skill": "", "level": 0, "category": ""}],
  "missingSkills": [{"skill": "", "priority": "high|medium|low", "difficulty": "easy|medium|hard", "timeToLearn": ""}],
  "weakAreas": ["area1", ...],
  "strengthAreas": ["area1", ...],
  "overallReadiness": 0,
  "aiReadiness": 0,
  "interviewReadiness": 0,
  "portfolioStrength": 0,
  "careerHealth": 0
}

Profile:
- Name: ${profile.name}
- Current Skills: ${profile.skills?.join(", ")}
- Technologies: ${profile.technologies?.join(", ")}
- Experience: ${profile.yearsOfExperience} years
- Target Role: ${profile.targetRole}
- Target Industry: ${profile.targetIndustry}`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON(raw, {
    targetRole: profile.targetRole,
    currentSkills: [],
    missingSkills: [],
    weakAreas: [],
    strengthAreas: [],
    overallReadiness: 55,
    aiReadiness: 50,
    interviewReadiness: 45,
    portfolioStrength: 50,
    careerHealth: 55,
  })
}

// ─── Agent 3: Career Advisor ─────────────────────────────────────────────────
export async function runCareerAdvisorAgent(profile: CareerProfile, apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are a world-class Career Advisor Agent with 20+ years of experience. You provide data-driven career guidance with salary insights and market intelligence. Always respond with valid JSON.`),
    userMsg(`Provide comprehensive career advice for this professional and return ONLY a JSON object:
{
  "bestCareerPath": {"title": "", "reason": "", "salaryMin": 0, "salaryMax": 0, "growthRate": ""},
  "alternativeCareerPaths": [{"title": "", "reason": "", "salaryMin": 0, "salaryMax": 0, "fitScore": 0}],
  "salaryEstimate": {"min": 0, "max": 0, "median": 0, "currency": "USD"},
  "industryDemand": "high|medium|low",
  "remotePossibility": "high|medium|low",
  "futureTrends": ["trend1", ...],
  "timeToGoal": "string",
  "motivationalMessage": "string"
}

Profile:
- Skills: ${profile.skills?.join(", ")}
- Experience: ${profile.yearsOfExperience} years
- Target Role: ${profile.targetRole}
- Target Salary: ${profile.targetSalary}
- Preferred Country: ${profile.preferredCountry}
- Industry: ${profile.targetIndustry}`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON(raw, {
    bestCareerPath: { title: profile.targetRole, reason: "Strong match", salaryMin: 80000, salaryMax: 130000, growthRate: "15%" },
    alternativeCareerPaths: [],
    salaryEstimate: { min: 80000, max: 130000, median: 105000, currency: "USD" },
    industryDemand: "high",
    remotePossibility: "high",
    futureTrends: [],
    timeToGoal: "6-12 months",
    motivationalMessage: "You have great potential!",
  })
}

// ─── Agent 4: Learning Planner ───────────────────────────────────────────────
export async function runLearningPlannerAgent(profile: CareerProfile, skillGap: AgentResults["skillGap"], apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are an expert Learning Planner Agent. You create personalized, structured learning roadmaps that are realistic and actionable. Always respond with valid JSON.`),
    userMsg(`Create a comprehensive learning roadmap and return ONLY a JSON object:
{
  "month1": {"goals": [""], "courses": [{"title": "", "platform": "", "free": true, "url": ""}], "projects": [""]},
  "month3": {"goals": [""], "courses": [{"title": "", "platform": "", "free": true}], "skills": [""]},
  "month6": {"goals": [""], "certifications": [""], "milestones": [""]},
  "month12": {"goals": [""], "expectedRole": "", "expectedSalary": 0},
  "resources": {
    "freeCourses": [{"title": "", "platform": "", "topic": ""}],
    "paidCourses": [{"title": "", "platform": "", "price": ""}],
    "books": [{"title": "", "author": ""}],
    "youtubeChannels": [""],
    "platforms": [""],
    "documentation": [""]
  },
  "weeklyHours": 0,
  "dailyPlan": ["task1", "task2", "task3"]
}

Missing Skills: ${skillGap?.missingSkills?.map((s: { skill: string }) => s.skill).join(", ")}
Target Role: ${profile.targetRole}
Current Level: ${profile.yearsOfExperience} years`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON(raw, {
    month1: { goals: [], courses: [], projects: [] },
    month3: { goals: [], courses: [], skills: [] },
    month6: { goals: [], certifications: [], milestones: [] },
    month12: { goals: [], expectedRole: profile.targetRole, expectedSalary: 100000 },
    resources: { freeCourses: [], paidCourses: [], books: [], youtubeChannels: [], platforms: [], documentation: [] },
    weeklyHours: 15,
    dailyPlan: [],
  })
}

// ─── Agent 5: Project Generator ──────────────────────────────────────────────
export async function runProjectGeneratorAgent(profile: CareerProfile, apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are a Portfolio Project Generator Agent. You suggest impactful, buildable projects that dramatically improve a developer's portfolio and interview prospects. Always respond with valid JSON.`),
    userMsg(`Suggest 6 portfolio projects and return ONLY a JSON array:
[
  {
    "name": "",
    "description": "",
    "difficulty": "beginner|intermediate|advanced",
    "techStack": [""],
    "skills": [""],
    "estimatedTime": "",
    "resumeImpact": "low|medium|high",
    "githubValue": "low|medium|high",
    "keyFeatures": [""],
    "why": ""
  }
]

Current Skills: ${profile.skills?.join(", ")}
Technologies: ${profile.technologies?.join(", ")}
Target Role: ${profile.targetRole}
Experience Level: ${profile.yearsOfExperience} years`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON<unknown[]>(raw, [])
}

// ─── Agent 6: Interview Mentor ───────────────────────────────────────────────
export async function runInterviewMentorAgent(profile: CareerProfile, apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are an elite Interview Mentor Agent. You prepare candidates with the exact questions they will face in technical interviews, behavioral rounds, and HR discussions. You provide COMPLETE, DETAILED answers for every question — not just hints. Always respond with valid JSON.`),
    userMsg(`Generate comprehensive interview preparation material and return ONLY a JSON object:
{
  "technical": [{"question": "", "answer": "", "hint": "", "difficulty": "easy|medium|hard", "category": ""}],
  "behavioral": [{"question": "", "answer": "", "framework": "STAR|CAR|PAR", "tip": ""}],
  "hr": [{"question": "", "answer": "", "bestAnswer": ""}],
  "coding": [{"topic": "", "question": "", "answer": "", "examples": [""], "difficulty": "easy|medium|hard"}],
  "systemDesign": [{"topic": "", "question": "", "answer": "", "keyPoints": [""]}],
  "confidenceScore": 0,
  "preparationAdvice": ""
}

Rules:
- For technical: provide a thorough answer (3-6 sentences) explaining the concept clearly
- For behavioral: provide a full STAR-format sample answer specific to this candidate's background
- For HR: provide a complete, confident, personalized answer
- For coding: provide explanation of approach and key concepts
- For systemDesign: provide architecture overview and trade-offs
- Generate at least 6 technical, 5 behavioral, 5 HR, 4 coding, 3 system design questions

Role: ${profile.targetRole}
Skills: ${profile.skills?.join(", ")}
Technologies: ${profile.technologies?.join(", ")}
Experience: ${profile.yearsOfExperience} years
Name: ${profile.name}`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON(raw, {
    technical: [],
    behavioral: [],
    hr: [],
    coding: [],
    systemDesign: [],
    confidenceScore: 60,
    preparationAdvice: "",
  })
}

// ─── Agent 7: Job Matcher ─────────────────────────────────────────────────────
export async function runJobMatcherAgent(profile: CareerProfile, apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are a Job Matching Intelligence Agent. You match professionals with the ideal companies and roles based on their skills, experience, and career goals. Always respond with valid JSON.`),
    userMsg(`Recommend 8 companies and roles and return ONLY a JSON array:
[
  {
    "company": "",
    "role": "",
    "matchScore": 0,
    "reason": "",
    "salaryMin": 0,
    "salaryMax": 0,
    "requiredSkills": [""],
    "missingSkills": [""],
    "preparationTime": "",
    "remote": true,
    "companyType": "startup|mid|enterprise",
    "industry": ""
  }
]

Skills: ${profile.skills?.join(", ")}
Technologies: ${profile.technologies?.join(", ")}
Target Role: ${profile.targetRole}
Experience: ${profile.yearsOfExperience} years
Preferred Country: ${profile.preferredCountry}
Target Salary: ${profile.targetSalary}`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON<unknown[]>(raw, [])
}

// ─── Agent 8: Career Coach ───────────────────────────────────────────────────
export async function runCareerCoachAgent(profile: CareerProfile, apiKey: string) {
  const messages: Message[] = [
    systemMsg(`You are a world-class Career Coach and Mentor. You provide motivational, practical, and personalized career guidance. You think like a senior mentor who genuinely cares about the candidate's success. Always respond with valid JSON.`),
    userMsg(`Provide a comprehensive coaching session and return ONLY a JSON object:
{
  "weeklyGoals": ["goal1", "goal2", "goal3", "goal4", "goal5"],
  "dailyTasks": [{"day": "Monday", "tasks": [""]}, {"day": "Tuesday", "tasks": [""]}, {"day": "Wednesday", "tasks": [""]}, {"day": "Thursday", "tasks": [""]}, {"day": "Friday", "tasks": [""]}],
  "motivationalMessage": "",
  "productivityTips": ["tip1", ...],
  "learningStrategy": "",
  "timeManagement": ["tip1", ...],
  "mindsetAdvice": "",
  "milestones": [{"week": 1, "goal": ""}, {"week": 2, "goal": ""}, {"week": 4, "goal": ""}],
  "successPrediction": ""
}

Name: ${profile.name}
Target Role: ${profile.targetRole}
Current Skills: ${profile.skills?.slice(0, 10).join(", ")}
Experience: ${profile.yearsOfExperience} years`),
  ]
  const raw = await callGroq(messages, apiKey)
  return parseJSON(raw, {
    weeklyGoals: [],
    dailyTasks: [],
    motivationalMessage: "You have the potential to achieve great things!",
    productivityTips: [],
    learningStrategy: "",
    timeManagement: [],
    mindsetAdvice: "",
    milestones: [],
    successPrediction: "",
  })
}
