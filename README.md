# CareerDNA AI ⚡
**CareerDNA AI** is a premium, AI-powered Career Operating System designed to help professionals analyze their resumes, identify skill gaps, generate custom portfolios, simulate interviews, and track weekly career development roadmaps.
Powered by advanced LLMs (Llama 3.3, Llama 3.1, Mixtral, and Gemma) via **Groq Cloud API**.
---
## 🚀 Key Features
* **📊 Career Dashboard**: A multi-dimensional competency score dashboard with an interactive Recharts competency radar mapping overall readiness, AI readiness, portfolio strength, and resume quality.
* **📄 Resume Intelligence**: Upload a PDF, DOCX, or TXT file. Uses a zero-dependency browser-side text extractor to parse your profile, experience, projects, and education.
* **🧠 AI Skill Gap Analyzer**: Compares your skills against your target role to suggest high-priority skills to learn, difficulty levels, and time estimates.
* **🎯 Career Match & Advisor**: Evaluates role compatibility, lists alternative career paths with market demand, salary ranges, and remote feasibility.
* **📚 Learning Roadmap**: Generates month-by-month study milestones, lists recommended resources (books, documentation, free & paid courses), and calculates weekly hour commitments.
* **💼 Job Recommendations**: Curates match-scored jobs at startups, mid-sized, and enterprise companies.
* **🎙️ Interview Mentor**: Custom-generates technical questions, behavioral scenarios (with detailed **STAR framework** answers), HR questions, coding topics, and system design pipelines.
* **📅 Weekly Action Plan**: A career coach that plans your week day-by-day, providing productivity tips, mindset advice, and milestones.
* **📈 Progress Tracker**: A personal checklist to log completed skills, courses, and projects.
---
## 🛠️ Tech Stack
* **Frontend**: React 19 + TypeScript + Vite
* **Styles**: Tailwind CSS 4.0 & custom styling
* **Components**: Custom Radix UI & shadcn/ui library
* **AI Engine**: Groq Cloud completions API
* **Charts**: Recharts (Radar, Bar, Line Charts)
* **Document Extraction**: PDF.js (via browser CDN) & custom XML DOCX zip parser
---
## ⚙️ Setup and Installation
### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.
### 1. Clone & Install Dependencies
Navigate to the project root directory and run:
```bash
npm install
```
### 2. Configure API Key
Create or edit the `.env` file in the root folder and add your Groq API Key:
```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```
> **Tip**: You can get a free API key at [console.groq.com](https://console.groq.com/).
### 3. Start Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
---
## ⚡ Active Model Switching (Rate Limit Fix)
If you hit rate limits on the free tier when using the default **Llama 3.3 70B** model, navigate to **Settings** in the application and select **Llama 3.1 8B Instant**.
|
 Model 
|
 Recommendation 
|
 Advantages 
|
|
---
|
---
|
---
|
|
**
Llama 3.1 8B Instant
**
|
**
Recommended
**
|
 Extremely fast, very high daily rate limits. 
|
|
**
Llama 3.3 70B Versatile
**
|
 Power User 
|
 Deep reasoning, but low daily rate limits (100k TPD). 
|
|
**
Mixtral 8x7B 32k
**
|
 Alternative 
|
 Balanced reasoning and context size. 
|
|
**
Gemma 2 9B IT
**
|
 Alternative 
|
 Fast reasoning. 
|
---
## 📄 License
This project is private and for personal career development planning.
