export const SITE_CONFIG = {
  name: "DevTrack",
  tagline: "Software Project Management System",
  description:
    "The modern platform for academic software project management. Track projects, collaborate in teams, and evaluate with powerful analytics.",
  url: "https://devtrack.dev",
}

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const

export const HERO_CONTENT = {
  badge: "Built for academic excellence",
  title: "Modern Software Project\nManagement for Academia",
  subtitle:
    "The all-in-one platform for managing student software projects. Track GitHub activity, evaluate progress, and collaborate seamlessly — from classroom to deployment.",
  primaryCta: { label: "Get Started Free", href: "/register" },
  secondaryCta: { label: "View Demo", href: "#dashboard-showcase" },
  trustedBy: [
    { name: "MIT", logo: "MIT" },
    { name: "Stanford", logo: "Stanford" },
    { name: "Berkeley", logo: "Berkeley" },
    { name: "CMU", logo: "CMU" },
    { name: "Georgia Tech", logo: "GA Tech" },
  ],
}

export const FEATURES = [
  {
    icon: "Kanban",
    title: "Project Tracking",
    description:
      "Kanban boards, sprint planning, and milestone tracking designed for academic team projects.",
    gradient: "from-primary/20 to-primary/10",
  },
  {
    icon: "Users",
    title: "Group Management",
    description:
      "Create teams, assign roles, and manage group dynamics with intelligent pairing and oversight.",
    gradient: "from-primary/20 to-primary/10",
  },
  {
    icon: "GitBranch",
    title: "GitHub Integration",
    description:
      "Deep GitHub integration with commit tracking, PR reviews, and contribution analytics.",
    gradient: "from-primary/20 to-primary/10",
  },
  {
    icon: "Milestone",
    title: "Milestone Tracking",
    description:
      "Define project phases, set deadlines, and track progress with automated status updates.",
    gradient: "from-primary/20 to-primary/10",
  },
  {
    icon: "BarChart3",
    title: "Analytics Dashboard",
    description:
      "Real-time insights into team productivity, code quality, and project health metrics.",
    gradient: "from-primary/20 to-primary/10",
  },
  {
    icon: "Bell",
    title: "Smart Notifications",
    description:
      "Context-aware alerts for deadlines, PR reviews, merge conflicts, and team updates.",
    gradient: "from-primary/20 to-primary/10",
  },
  {
    icon: "MessageSquare",
    title: "Team Collaboration",
    description:
      "Built-in messaging, code reviews, and real-time collaboration tools for distributed teams.",
    gradient: "from-primary/20 to-primary/10",
  },
  {
    icon: "Award",
    title: "Evaluation System",
    description:
      "Rubric-based grading, peer reviews, and automated assessment powered by GitHub data.",
    gradient: "from-primary/20 to-primary/10",
  },
]

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Create Your Classroom",
    description:
      "Set up your course with a few clicks. Define projects, milestones, and evaluation criteria.",
    icon: "GraduationCap",
  },
  {
    step: 2,
    title: "Assign Groups",
    description:
      "Intelligently form teams based on skills, or let students self-organize into project groups.",
    icon: "Users",
  },
  {
    step: 3,
    title: "Track Projects",
    description:
      "Monitor progress through GitHub integration. See commits, PRs, and issues in real-time.",
    icon: "GitBranch",
  },
  {
    step: 4,
    title: "Review GitHub Activity",
    description:
      "Dive into contribution analytics. Review code quality, commit patterns, and team velocity.",
    icon: "GitCommitHorizontal",
  },
  {
    step: 5,
    title: "Evaluate Performance",
    description:
      "Generate comprehensive reports. Grade with rubrics, peer feedback, and data-driven insights.",
    icon: "BarChart3",
  },
]

export const PRICING_PLANS = [
  {
    name: "Academic Free",
    description: "Perfect for individual courses and small classes.",
    price: "$0",
    period: "/month",
    features: [
      "Up to 3 classrooms",
      "50 students per class",
      "Basic GitHub integration",
      "Kanban boards",
      "Email support",
    ],
    cta: "Get Started",
    href: "/register",
    featured: false,
  },
  {
    name: "Department",
    description: "For departments managing multiple courses.",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited classrooms",
      "200 students per class",
      "Advanced GitHub analytics",
      "Custom rubrics",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    href: "/register",
    featured: true,
  },
  {
    name: "Enterprise",
    description: "University-wide deployment with dedicated support.",
    price: "Custom",
    period: "",
    features: [
      "Unlimited everything",
      "SSO & SAML",
      "On-premise option",
      "Dedicated success manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
]

export const FAQ_DATA = [
  {
    question: "How does DevTrack integrate with GitHub?",
    answer:
      "DevTrack connects directly with GitHub via OAuth. It automatically tracks commits, pull requests, issues, and code review activity for all student repositories within a classroom. Teachers get real-time visibility into contribution patterns without any manual effort.",
  },
  {
    question: "Can I use DevTrack with my existing LMS?",
    answer:
      "Yes. DevTrack supports integration with Canvas, Blackboard, and Moodle. Grades and roster data sync automatically, making it easy to adopt alongside your existing institution tools.",
  },
  {
    question: "Is there a free plan for educators?",
    answer:
      "Absolutely. The Academic Free plan is completely free for individual educators. It supports up to 3 classrooms with 50 students each, including full GitHub integration and Kanban boards.",
  },
  {
    question: "How does grading work?",
    answer:
      "DevTrack uses a flexible rubric system. Instructors define criteria, weightage, and grading scales. The system auto-populates GitHub contribution data, peer reviews, and milestone completion for objective assessment. Manual adjustments are always possible.",
  },
  {
    question: "Can students form their own groups?",
    answer:
      "Yes. DevTrack supports multiple group formation models: instructor-assigned, student self-select, and algorithm-based smart grouping that balances skills and experience levels.",
  },
  {
    question: "What analytics are available?",
    answer:
      "DevTrack provides comprehensive analytics including team velocity charts, individual contribution heatmaps, code quality metrics, milestone burndown, and submission timelines. All data exports to CSV/PDF.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is a top priority. DevTrack uses encryption at rest and in transit, SOC 2 compliant infrastructure, and role-based access control. Enterprise plans offer on-premise deployment options.",
  },
]

export const TESTIMONIALS = [
  {
    quote:
      "DevTrack transformed how we teach software engineering. The GitHub integration alone saved us dozens of hours per semester, and students love the transparency.",
    author: "Dr. Sarah Chen",
    role: "Professor of Computer Science",
    institution: "Stanford University",
    rating: 5,
  },
  {
    quote:
      "The analytics dashboard gives me real-time visibility into every team's progress. I can spot struggling groups before their first milestone deadline.",
    author: "Prof. James Rodriguez",
    role: "Software Engineering Lead",
    institution: "MIT",
    rating: 5,
  },
  {
    quote:
      "Our students ship better projects because DevTrack makes collaboration and GitHub workflows natural. It's become an essential part of our curriculum.",
    author: "Dr. Emily Nakamura",
    role: "Dept. Chair, Computer Science",
    institution: "UC Berkeley",
    rating: 5,
  },
  {
    quote:
      "Setting up group projects used to be a nightmare. DevTrack handles everything from team formation to final grading. It's a game-changer.",
    author: "Prof. Michael Okafor",
    role: "Senior Lecturer",
    institution: "Georgia Tech",
    rating: 5,
  },
  {
    quote:
      "The peer review system and rubric-based grading have made assessment so much more objective. Students appreciate the transparency.",
    author: "Dr. Lisa van der Meer",
    role: "Associate Professor",
    institution: "TU Delft",
    rating: 5,
  },
  {
    quote:
      "DevTrack bridges the gap between academic project management and real-world software development practices. Essential for any modern CS department.",
    author: "Prof. Alex Kim",
    role: "Director of Undergraduate Studies",
    institution: "Carnegie Mellon University",
    rating: 5,
  },
]

export const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
]
