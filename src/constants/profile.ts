/**
 * Single source of truth for Owen's personal info. Apps (AboutMe, Basketball,
 * GitHub, Terminal, seed filesystem) read from here so updating a fact once
 * updates it everywhere.
 */

export const PROFILE = {
  name: "Owen Stepan",
  firstName: "Owen",
  username: "owen",
  title: "CS @ Northeastern · AI & Full-Stack Engineer",
  location: "Boston, MA",
  hometown: "Chicago, IL",
  school: "Northeastern University — Khoury College of Computer Sciences",
  degree: "B.S. Computer Science (AI Concentration, Robotics Minor)",
  gradYear: 2027,
  gpa: "3.84",
  currentRole: "Software Engineer Co-op @ Subconscious.dev (MIT CSAIL spinout)",
  bio:
    "I build AI agents and the infrastructure that runs them. Currently on " +
    "co-op at Subconscious.dev, where I build agent benchmarking platforms " +
    "on AWS and autonomous dev pipelines that take tickets from spec to pull " +
    "request. Before that: Android at Ahold Delhaize, housing tech with " +
    "Code4Community, and my own social platform startup. Former varsity " +
    "basketball captain from Chicago.",
  email: "stepan.o@northeastern.edu",
  githubUsername: "ostepan8",
  githubUrl: "https://github.com/ostepan8",
  linkedinUrl: "https://linkedin.com/in/owen-stepan",
  siteUrl: "https://owen-stepan.com",
  resumePath: "/Owen-Stepan-Resume.pdf",
  resumeFileName: "Owen Stepan — Resume.pdf",
} as const;

export const SKILL_GROUPS: readonly { label: string; skills: readonly string[] }[] = [
  {
    label: "AI & Agents",
    skills: ["Anthropic SDK", "OpenAI SDK", "LangChain", "PydanticAI", "RAG", "Fine-tuning pipelines"],
  },
  {
    label: "Languages",
    skills: ["Python", "TypeScript", "Kotlin", "Java", "C++", "C", "SQL"],
  },
  {
    label: "Web & Mobile",
    skills: ["React", "Next.js", "Node.js", "Nest.js", "React Native", "Jetpack Compose", "Tailwind"],
  },
  {
    label: "Cloud & Data",
    skills: ["AWS Lambda", "Step Functions", "ECS Fargate", "Aurora", "PostgreSQL", "MongoDB", "Vercel"],
  },
];

export interface StatLine {
  readonly label: string;
  readonly value: string;
}

/** Quick-hit facts rendered as stat cards in About Me. */
export const PROFILE_STATS: readonly StatLine[] = [
  { value: "3.84", label: "GPA · 4x Dean's List" },
  { value: "2", label: "Engineering Co-ops" },
  { value: "35+", label: "Public Repos" },
];

/** High school basketball career — sourced from MaxPreps. */
export const BASKETBALL = {
  school: "Francis W. Parker",
  schoolCity: "Chicago, IL",
  team: "Colonels",
  classYear: 2023,
  jerseyNumber: 0,
  position: "Guard",
  height: `6'2"`,
  role: "Team Captain",
  season: "2022–23 Varsity",
  maxprepsUrl:
    "https://www.maxpreps.com/il/chicago/francis-w-parker-colonels/athletes/owen-stepan/?careerid=9bjslgdh0mbue",
  stats: [
    { label: "PPG", value: "7.9" },
    { label: "RPG", value: "3.1" },
    { label: "APG", value: "1.4" },
    { label: "SPG", value: "1.5" },
    { label: "BPG", value: "0.7" },
    { label: "GP", value: "28" },
  ],
  achievements: [
    "Varsity team captain, senior season",
    "#1 in blocks per game among Illinois independent schools",
    "Top 40 in blocks per game, IHSA Division 2A",
    "Led team to 2023 IHSA Regional Finals",
  ],
  notableGames: [
    { date: "Feb 24, 2023", opponent: "Wells", note: "12 pts · Regional Finals" },
    { date: "Feb 22, 2023", opponent: "Ogden International", note: "8 pts · Regional semis W" },
    { date: "Jan 27, 2023", opponent: "Latin", note: "10 pts · 68–46 W" },
  ],
} as const;
