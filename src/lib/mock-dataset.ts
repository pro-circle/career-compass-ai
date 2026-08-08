// Typed sample dataset used ONLY when the browser-side mock overlay is on
// (Demo page → "Load Mock Data", or the top-bar button after signing in).
// Nothing here is ever written to Supabase, and AI features stay live.
import type {
  Application,
  AnalyticsMetric,
  Candidate,
  FunnelPoint,
  Job,
  JobMatch,
  NotificationItem,
  RoadmapItem,
  SkillRadarPoint,
  TrendPoint,
} from "./types";

export type InterviewSlot = {
  id: string;
  candidate: string;
  role: string;
  time: string;
  type: string;
  date: string;
  round: string;
};

export type InboxNotification = {
  id: string;
  type: "match" | "message" | "interview" | "offer" | "insight";
  title: string;
  desc: string;
  when: string;
  unread: boolean;
};

export type TalentPool = { id: string; label: string; count: number };

export type OfferRecord = {
  candidate: string;
  role: string;
  salary: string;
  equity: string;
  status: string;
  date: string;
};

export type PortfolioProject = {
  title: string;
  role: string;
  year: string;
  tags: string[];
  desc: string;
  gradient: string;
};

export type LearningResource = {
  title: string;
  provider: string;
  hours: number;
  skill: string;
  url: string;
};

export type TeamMember = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

export type ResumeInsight = { title: string; body: string; done: boolean };

export type Invoice = { id: string; date: string; amt: string };

export type Dataset = {
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  jobMatches: JobMatch[];
  notifications: NotificationItem[];
  skillRadar: SkillRadarPoint[];
  roadmap: RoadmapItem[];
  analyticsMetrics: AnalyticsMetric[];
  funnel: FunnelPoint[];
  trend: TrendPoint[];
  interviews: InterviewSlot[];
  interviewQuestions: Record<string, string[]>;
  inbox: InboxNotification[];
  talentPools: TalentPool[];
  offers: OfferRecord[];
  portfolioProjects: PortfolioProject[];
  learningResources: LearningResource[];
  teamMembers: TeamMember[];
  invoices: Invoice[];
  resumeScore: number;
  resumeInsights: ResumeInsight[];
  coverLetterDraft: string;
};

export const EMPTY_DATASET: Dataset = {
  jobs: [],
  candidates: [],
  applications: [],
  jobMatches: [],
  notifications: [],
  skillRadar: [],
  roadmap: [],
  analyticsMetrics: [],
  funnel: [],
  trend: [],
  interviews: [],
  interviewQuestions: { behavioral: [], technical: [], system: [] },
  inbox: [],
  talentPools: [],
  offers: [],
  portfolioProjects: [],
  learningResources: [],
  teamMembers: [],
  invoices: [],
  resumeScore: 0,
  resumeInsights: [],
  coverLetterDraft: "",
};


const jobs: Job[] = [
  {
    id: "JOB-001",
    title: "Senior Product Designer",
    department: "Design",
    location: "Remote · US",
    type: "Full-time",
    postedAgo: "3d ago",
    status: "Open",
    applicants: 82,
    new: 12,
    matchAvg: 87,
    salary: "$165k – $195k",
    description:
      "Own end-to-end product design for our core workspace: discovery, prototyping, and shipped surfaces.",
    tags: ["Figma", "Design Systems", "Prototyping"],
  },
  {
    id: "JOB-002",
    title: "Staff Backend Engineer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    postedAgo: "5d ago",
    status: "Open",
    applicants: 41,
    new: 6,
    matchAvg: 79,
    salary: "$210k – $245k",
    description:
      "Design and scale payment-critical services handling millions of events per day.",
    tags: ["Go", "Postgres", "Distributed Systems"],
  },
  {
    id: "JOB-003",
    title: "ML Research Scientist",
    department: "Research",
    location: "San Francisco, CA",
    type: "Full-time",
    postedAgo: "1w ago",
    status: "Open",
    applicants: 128,
    new: 21,
    matchAvg: 74,
    salary: "$230k – $310k",
    description: "Push the frontier of retrieval and ranking models for hiring workflows.",
    tags: ["PyTorch", "LLMs", "Evaluation"],
  },
  {
    id: "JOB-004",
    title: "Growth Marketing Lead",
    department: "Marketing",
    location: "Remote · Global",
    type: "Full-time",
    postedAgo: "1d ago",
    status: "Draft",
    applicants: 0,
    new: 0,
    matchAvg: 0,
    salary: "$140k – $170k",
    description: "Build the acquisition engine: lifecycle, paid, content, and partnerships.",
    tags: ["Lifecycle", "SEO", "Analytics"],
  },
];

const candidates: Candidate[] = [
  {
    id: "CAND-01",
    name: "Sarah Chen",
    title: "Senior Product Designer",
    company: "Linear",
    location: "San Francisco, CA",
    years: 8,
    matchScore: 96,
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    strengths: ["Systems thinking", "Ships fast", "Strong craft"],
    gaps: ["Limited B2C scale"],
    status: "Interviewing",
    appliedFor: "Senior Product Designer",
    aiInsight:
      "Portfolio shows three 0→1 launches with measurable retention lift; strongest systems designer in the pipeline.",
    portfolio: [
      { label: "Portfolio", url: "https://example.com/sarah" },
      { label: "Dribbble", url: "https://dribbble.com" },
    ],
    initials: "SC",
    email: "sarah.chen@example.com",
  },
  {
    id: "CAND-02",
    name: "Marcus Thorne",
    title: "Product Designer",
    company: "Stripe",
    location: "New York, NY",
    years: 6,
    matchScore: 91,
    skills: ["Product Design", "Motion", "UX Research"],
    strengths: ["Payments domain", "Motion craft"],
    gaps: ["Less design-system ownership"],
    status: "Screening",
    appliedFor: "Senior Product Designer",
    aiInsight: "Deep fintech context; strong candidate for checkout-adjacent surfaces.",
    portfolio: [{ label: "Site", url: "https://example.com/marcus" }],
    initials: "MT",
    email: "marcus.t@example.com",
  },
  {
    id: "CAND-03",
    name: "Anika Sharma",
    title: "Design Engineer",
    company: "Notion",
    location: "Bengaluru, IN",
    years: 5,
    matchScore: 88,
    skills: ["React", "TypeScript", "Design Systems", "CSS"],
    strengths: ["Design + code hybrid", "Accessibility"],
    gaps: ["Limited people leadership"],
    status: "New",
    appliedFor: "Senior Product Designer",
    aiInsight: "Rare hybrid profile — could accelerate design-system delivery immediately.",
    portfolio: [{ label: "GitHub", url: "https://github.com" }],
    initials: "AS",
    email: "anika@example.com",
  },
  {
    id: "CAND-04",
    name: "Diego Alvarez",
    title: "Staff Backend Engineer",
    company: "Datadog",
    location: "Remote · US",
    years: 10,
    matchScore: 84,
    skills: ["Go", "Kafka", "Postgres", "Kubernetes"],
    strengths: ["High-throughput systems", "Mentorship"],
    gaps: ["No payments experience"],
    status: "Final Round",
    appliedFor: "Staff Backend Engineer",
    aiInsight: "Owned a 4M events/min ingestion pipeline; strongest reliability signal in pipeline.",
    portfolio: [{ label: "GitHub", url: "https://github.com" }],
    initials: "DA",
    email: "diego@example.com",
  },
  {
    id: "CAND-05",
    name: "Yuki Tanaka",
    title: "Product Designer",
    company: "Figma",
    location: "Tokyo, JP",
    years: 4,
    matchScore: 76,
    skills: ["Interaction", "Accessibility", "Prototyping"],
    strengths: ["Interaction detail"],
    gaps: ["Junior for the level", "Timezone overlap"],
    status: "New",
    appliedFor: "Senior Product Designer",
    aiInsight: "Excellent craft but two levels below the target scope for this requisition.",
    portfolio: [],
    initials: "YT",
    email: "yuki@example.com",
  },
];

const applications: Application[] = [
  {
    id: "APP-01",
    jobTitle: "Senior Product Designer",
    company: "Linear",
    logo: "LN",
    appliedOn: "Jul 10, 2026",
    stage: "Interview",
    progress: 60,
    matchScore: 94,
    nextStep: "Hiring manager screen · Thu 10:00",
  },
  {
    id: "APP-02",
    jobTitle: "Staff Backend Engineer",
    company: "Stripe",
    logo: "ST",
    appliedOn: "Jul 15, 2026",
    stage: "Screening",
    progress: 35,
    matchScore: 81,
    nextStep: "Recruiter review in progress",
  },
  {
    id: "APP-03",
    jobTitle: "Design Lead",
    company: "Vercel",
    logo: "VC",
    appliedOn: "Jul 20, 2026",
    stage: "Applied",
    progress: 15,
    matchScore: 88,
    nextStep: "In queue",
  },
  {
    id: "APP-04",
    jobTitle: "Principal Designer",
    company: "Retool",
    logo: "RT",
    appliedOn: "Jun 28, 2026",
    stage: "Offer",
    progress: 90,
    matchScore: 92,
    nextStep: "Offer under review",
  },
];

const jobMatches: JobMatch[] = [
  {
    id: "MATCH-01",
    title: "Senior Product Designer",
    company: "Linear",
    location: "Remote · US",
    salary: "$165k – $195k",
    matchScore: 96,
    postedAgo: "3d ago",
    skills: ["Figma", "Design Systems", "Prototyping"],
    reason:
      "Your design-system work at scale maps directly to their platform team's next quarter roadmap.",
    logo: "LN",
  },
  {
    id: "MATCH-02",
    title: "Product Design Lead",
    company: "Vercel",
    location: "Remote · Global",
    salary: "$180k – $210k",
    matchScore: 91,
    postedAgo: "6d ago",
    skills: ["Leadership", "DX", "Design Systems"],
    reason: "They want a designer fluent in developer tooling — matches 4 of your last 5 projects.",
    logo: "VC",
  },
  {
    id: "MATCH-03",
    title: "Senior Designer, Growth",
    company: "Notion",
    location: "New York, NY",
    salary: "$155k – $180k",
    matchScore: 84,
    postedAgo: "1w ago",
    skills: ["Experimentation", "Landing Pages", "Analytics"],
    reason: "Growth experimentation is a stated goal in your profile; strong stretch match.",
    logo: "NT",
  },
  {
    id: "MATCH-04",
    title: "Design Engineer",
    company: "Raycast",
    location: "Remote · EU",
    salary: "$140k – $170k",
    matchScore: 78,
    postedAgo: "2w ago",
    skills: ["React", "TypeScript", "Motion"],
    reason: "Hybrid design-and-code role; your React work covers most of the requirements.",
    logo: "RC",
  },
];

const notifications: NotificationItem[] = [
  { id: "N1", title: "New 96% match: Senior Product Designer at Linear", time: "2h ago", type: "match" },
  { id: "N2", title: "Stripe moved your application to Screening", time: "5h ago", type: "application" },
  { id: "N3", title: "Interview scheduled with Linear — Thu 10:00", time: "yesterday", type: "interview" },
  { id: "N4", title: "Your weekly market report is ready", time: "2d ago", type: "insight" },
];

const skillRadar: SkillRadarPoint[] = [
  { skill: "Design Systems", you: 92, target: 90 },
  { skill: "Prototyping", you: 84, target: 88 },
  { skill: "User Research", you: 68, target: 85 },
  { skill: "Frontend", you: 74, target: 70 },
  { skill: "Leadership", you: 62, target: 80 },
  { skill: "Storytelling", you: 71, target: 85 },
];

const roadmap: RoadmapItem[] = [
  { week: "Week 1", title: "Sharpen research fundamentals", detail: "Run two moderated usability sessions and write a findings memo.", done: true },
  { week: "Week 2", title: "Ship a systems case study", detail: "Document token architecture and adoption metrics from your last role.", done: true },
  { week: "Week 3", title: "Leadership narrative", detail: "Prepare three STAR stories about mentoring and cross-team influence.", done: false },
  { week: "Week 4", title: "Portfolio polish + mock loop", detail: "Run a full mock interview loop and iterate on the weakest section.", done: false },
];

const analyticsMetrics: AnalyticsMetric[] = [
  { label: "Time to hire", value: "18d", delta: "-6d", positive: true },
  { label: "Applicants ranked", value: "812", delta: "+124", positive: true },
  { label: "Interview → offer", value: "34%", delta: "+4%", positive: true },
  { label: "Offer acceptance", value: "92%", delta: "-1%", positive: false },
];

const funnel: FunnelPoint[] = [
  { stage: "Applied", count: 812 },
  { stage: "Screened", count: 312 },
  { stage: "Interview", count: 128 },
  { stage: "Offer", count: 32 },
  { stage: "Hired", count: 24 },
];

const trend: TrendPoint[] = [
  { month: "Feb", hires: 3, applications: 96 },
  { month: "Mar", hires: 4, applications: 118 },
  { month: "Apr", hires: 2, applications: 104 },
  { month: "May", hires: 5, applications: 141 },
  { month: "Jun", hires: 4, applications: 167 },
  { month: "Jul", hires: 6, applications: 186 },
];

const interviews: InterviewSlot[] = [
  { id: "INT-01", candidate: "Sarah Chen", role: "Senior Product Designer", time: "10:00", type: "Portfolio review", date: "Jul 30", round: "Round 2" },
  { id: "INT-02", candidate: "Diego Alvarez", role: "Staff Backend Engineer", time: "14:30", type: "System design", date: "Jul 30", round: "Final" },
  { id: "INT-03", candidate: "Anika Sharma", role: "Design Engineer", time: "09:00", type: "Culture", date: "Jul 31", round: "Round 1" },
  { id: "INT-04", candidate: "Marcus Thorne", role: "Senior Product Designer", time: "16:00", type: "Craft deep dive", date: "Aug 01", round: "Round 2" },
];

const interviewQuestions: Record<string, string[]> = {
  behavioral: [
    "Tell me about a project where you had to change direction late. How did you handle it?",
    "Describe a time you disagreed with an engineering lead. What was the outcome?",
    "Walk me through the work you are most proud of and why.",
    "How do you handle feedback that conflicts with your own judgement?",
  ],
  technical: [
    "How would you structure a design-token system for three products sharing one brand?",
    "Walk me through your process from ambiguous brief to shipped feature.",
    "How do you measure whether a design change actually worked?",
    "Describe how you'd audit an existing product for accessibility issues.",
  ],
  system: [
    "Design a job-matching service that ranks 10M candidate/job pairs per day.",
    "How would you design a resume parsing pipeline that is resilient to bad input?",
    "Design notification delivery for interview reminders across email and push.",
    "How would you roll out a scoring model change safely to production?",
  ],
};

const inbox: InboxNotification[] = [
  { id: "IN-1", type: "offer", title: "Offer received — Linear", desc: "Senior Product Designer · $205k + 0.18% equity. Review by Friday.", when: "12m ago", unread: true },
  { id: "IN-2", type: "interview", title: "Interview scheduled with Figma", desc: "Final panel on Tue, 10:00 AM PT with the product design team.", when: "1h ago", unread: true },
  { id: "IN-3", type: "match", title: "3 new 95%+ matches", desc: "Roles at Stripe, Vercel, and Notion align with your profile.", when: "3h ago", unread: true },
  { id: "IN-4", type: "message", title: "Message from Amelia Ford", desc: "Loved chatting last week — happy to make the intro.", when: "Yesterday", unread: false },
  { id: "IN-5", type: "insight", title: "Your resume score improved to 92", desc: "The optimizer applied 4 suggestions. See what changed.", when: "2d ago", unread: false },
  { id: "IN-6", type: "interview", title: "Mock interview report ready", desc: "Overall score 87 — strong on system design, refine STAR framing.", when: "4d ago", unread: false },
];

const talentPools: TalentPool[] = [
  { id: "all", label: "All talent", count: 248 },
  { id: "senior-eng", label: "Senior Engineers", count: 68 },
  { id: "design", label: "Product Designers", count: 42 },
  { id: "pm", label: "PM · GTM", count: 36 },
  { id: "silver", label: "Silver medalists", count: 22 },
];

const offers: OfferRecord[] = [
  { candidate: "Sarah Chen", role: "Senior Product Designer", salary: "$185,000", equity: "0.15%", status: "Signed", date: "Mar 09" },
  { candidate: "Marcus Rivera", role: "Staff Engineer", salary: "$225,000", equity: "0.22%", status: "Sent", date: "Mar 08" },
  { candidate: "Priya Nair", role: "Data Scientist", salary: "$168,000", equity: "0.10%", status: "Drafted", date: "Mar 07" },
  { candidate: "Diego Alvarez", role: "Product Manager", salary: "$195,000", equity: "0.18%", status: "Declined", date: "Mar 03" },
];

const portfolioProjects: PortfolioProject[] = [
  { title: "Insights Dashboard", role: "Lead Designer", year: "2025", tags: ["Product", "Data viz", "Figma"], desc: "Redesigned the analytics surface for 30k+ teams. Increased daily activation by 41%.", gradient: "from-brand to-accent" },
  { title: "Checkout — Mobile", role: "Senior Designer", year: "2024", tags: ["Payments", "iOS", "Motion"], desc: "Reimagined the tap-to-pay experience with zero cognitive friction across 40 markets.", gradient: "from-purple-500 to-pink-500" },
  { title: "Collaboration Templates", role: "IC Designer", year: "2023", tags: ["Design system", "Templates"], desc: "Shipped a template gallery used by 2M+ collaborators in the first quarter.", gradient: "from-amber-500 to-red-500" },
  { title: "Preview Deploy UX", role: "Consultant", year: "2023", tags: ["Devtools", "Onboarding"], desc: "Refreshed the preview deployment experience for enterprise plans.", gradient: "from-slate-700 to-slate-900" },
];

const learningResources: LearningResource[] = [
  { title: "Designing Data-Intensive Applications", provider: "O'Reilly", hours: 24, skill: "Systems Design", url: "https://dataintensive.net" },
  { title: "The Staff Engineer's Path", provider: "O'Reilly", hours: 16, skill: "Leadership", url: "https://www.oreilly.com" },
  { title: "Advanced Testing with Vitest", provider: "Frontend Masters", hours: 6, skill: "Testing", url: "https://frontendmasters.com" },
  { title: "React Performance Deep Dive", provider: "epicreact.dev", hours: 12, skill: "Perf", url: "https://epicreact.dev" },
];

const teamMembers: TeamMember[] = [
  { name: "Julianne Deitch", email: "julianne@example.com", role: "Owner", initials: "JD" },
  { name: "Marcus Cho", email: "marcus@example.com", role: "Admin", initials: "MC" },
  { name: "Priya Shah", email: "priya@example.com", role: "Recruiter", initials: "PS" },
  { name: "Elena Ivanov", email: "elena@example.com", role: "Hiring Manager", initials: "EI" },
];

const invoices: Invoice[] = [
  { id: "INV-2026-03", date: "Mar 12, 2026", amt: "$4,800.00" },
  { id: "INV-2025-03", date: "Mar 12, 2025", amt: "$3,600.00" },
  { id: "INV-2024-03", date: "Mar 12, 2024", amt: "$2,400.00" },
];

const resumeInsights: ResumeInsight[] = [
  { title: "Add quantifiable impact metrics", body: "Rewrite 3 bullets with numbers (e.g. shipped v2 to 40k users).", done: false },
  { title: "Strengthen keyword density", body: "Add: 'design systems', 'component library', 'a11y'.", done: false },
  { title: "Fix section ordering", body: "Move 'Experience' above 'Education' for senior roles.", done: true },
  { title: "Improve action verbs", body: "Replace 'worked on' with 'shipped', 'led', 'owned'.", done: true },
];

const coverLetterDraft = `Dear Hiring Team,

I've followed your product craft closely for the last three years — joining as your next Senior Product Designer feels like the most natural next step for my career.

In my last role I led the redesign of our design-system tooling, shipping a 40% adoption lift across 12 product teams. That work sharpened my belief that great B2B software is a design problem.

I'd love to bring the same rigor to your team.

Thanks for considering me.
`;

export const MOCK_DATASET: Dataset = {
  jobs,
  candidates,
  applications,
  jobMatches,
  notifications,
  skillRadar,
  roadmap,
  analyticsMetrics,
  funnel,
  trend,
  interviews,
  interviewQuestions,
  inbox,
  talentPools,
  offers,
  portfolioProjects,
  learningResources,
  teamMembers,
  invoices,
  resumeScore: 72,
  resumeInsights,
  coverLetterDraft,
};

