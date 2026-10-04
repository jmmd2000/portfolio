import type { currently, education, experience, profile, projects, skills, socials } from "./schema";

interface SeedData {
  profile: typeof profile.$inferInsert;
  socials: (typeof socials.$inferInsert)[];
  experience: (typeof experience.$inferInsert)[];
  skills: (typeof skills.$inferInsert)[];
  education: (typeof education.$inferInsert)[];
  projects: (typeof projects.$inferInsert)[];
  currently: (typeof currently.$inferInsert)[];
}

/** The site's starting content. It seeds production once at launch, and dev and test on every reset. */
export const seedData: SeedData = {
  profile: {
    name: "James Doyle",
    role: "Software Engineer",
    bio: "I got into development through CoderDojo as a kid, studied Computer Science at Maynooth University, and now work as a Software Engineer at Ericsson. I like building for the web and messing around with side projects. When I’m not coding, I’m usually listening to music, playing games, or spending time with my partner.",
    location: "Dublin, Ireland ☘️",
  },

  socials: [
    { name: "GitHub", url: "https://github.com/jmmd2000", sort: 1 },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/jamesmddoyle/", sort: 2 },
    { name: "Email", url: "mailto:hi@jamesmddoyle.com", sort: 3 },
  ],

  experience: [
    {
      title: "Software Engineer",
      company: "Ericsson",
      companyURL: "https://www.ericsson.com/",
      location: "Athlone, Ireland",
      logoURL: "https://assets.jamesmddoyle.com/ericsson-vZu3qlLA.png",
      startDate: "2023-07-01",
      endDate: null,
      bullets: [
        "Serve as test lead for a team of 8 to 14 engineers, defining test strategy, coordinating test efforts, and helping ensure release quality for a core microservice in a global telecom platform with hundreds of customer deployments.",
        "Developed and maintained a containerised PostgreSQL database microservice, using Helm and Kubernetes to support reliable, highly-available and persistent data storage within a global telecom management platform.",
        "Built and maintained 6 Jenkins pipelines that support the team's CI/CD workflows across development and testing, achieving 25% faster test runs and 15% faster releases.",
        "Lead the team’s work on a product-wide benchmarking tool, building performance testing capabilities that help customer teams validate hardware readiness, identify performance limitations, and reduce deployment risk for the wider telecom product.",
        "Wrote operational guides for heartbeat activities, test processes and onboarding, and reorganised the team’s Confluence space containing hundreds of pages, leading to a 10% increase in team efficiency.",
      ],
      tags: ["Kubernetes", "PostgreSQL", "Python", "Go", "Helm", "Jenkins"],
    },
    {
      title: "Front-End Developer Intern",
      company: "Fusio",
      companyURL: "https://www.fusio.net/",
      location: "Dublin, Ireland",
      logoURL: "https://assets.jamesmddoyle.com/fusio-eV2UCMog.png",
      startDate: "2022-01-01",
      endDate: "2022-07-01",
      bullets: [
        "Resolved client support requests by investigating website issues, responding to customer queries by email, and coordinating fixes across CMS-managed and static HTML websites.",
        "Maintained content across 10 to 15 client websites using CMS platforms and raw HTML edits, helping keep live websites accurate, up to date, and aligned with client requirements.",
        "Designed and implemented responsive website interfaces for mobile, desktop, and tablet layouts, improving usability and visual consistency across multiple device sizes.",
      ],
      tags: ["HTML", "CSS", "JavaScript", "WordPress"],
    },
  ],

  skills: [
    { category: "Frontend", items: ["HTML", "CSS", "React", "TypeScript", "Svelte"], sort: 1 },
    { category: "Backend & Data", items: ["Node.js", "PostgreSQL"], sort: 2 },
    { category: "DevOps & CI/CD", items: ["Docker", "Kubernetes", "Helm", "Jenkins"], sort: 3 },
    { category: "Languages", items: ["TypeScript", "Python", "Go"], sort: 4 },
  ],

  education: [
    {
      degree: "BSc Computer Science & Software Engineering",
      institution: "Maynooth University",
      location: "Maynooth, Co. Kildare",
      grade: "2.1 (3.3 GPA)",
      startYear: 2019,
      endYear: 2023,
    },
    {
      degree: "QQI Level 5 Computer Systems and Networks",
      institution: "Dunboyne College of Further Education",
      location: "Dunboyne, Co. Meath",
      grade: "Full honours, distinctions in every module",
      startYear: 2018,
      endYear: 2019,
    },
  ],

  projects: [
    {
      title: "JamesReviewsMusic",
      description: "A personal music blog where I write reviews and track scores.",
      imageURL: "https://assets.jamesmddoyle.com/jrm.webp",
      sourceURL: "https://github.com/jmmd2000/album-review-fullstack",
      liveURL: "https://jamesreviewsmusic.com/",
      liveLabel: "Live site",
      stack: ["React", "TypeScript", "Hono.js", "PostgreSQL", "Docker"],
      year: 2025,
      highlights: [
        "Designed and built a full-stack web application for creating and managing personal album reviews.",
        "Developed a RESTful backend API with Hono.js and PostgreSQL, using Drizzle ORM for type-safe database access.",
        "Implemented a modern frontend with React and Vite, and added automated backend testing with Jest to validate core application logic.",
        "Containerised the application using Docker Compose and configured a Jenkins pipeline to automate deployments.",
      ],
      featured: true,
      showOnCV: true,
      published: true,
      sort: 1,
    },
    {
      title: "Phantom",
      description: "A mock API server and traffic inspector built on raw TCP sockets.",
      imageURL: "https://assets.jamesmddoyle.com/phantom.webp",
      sourceURL: "https://github.com/jmmd2000/phantom",
      liveURL: "https://www.npmjs.com/package/@jamesmddoyle/phantom",
      liveLabel: "npm",
      stack: ["Svelte", "TypeScript", "Node.js"],
      year: 2026,
      highlights: [
        "Built a low-level HTTP/1.1 mock server from scratch using raw Node.js TCP sockets instead of high-level frameworks.",
        "Developed a custom HTTP parser to handle manual byte-stream processing, including support for chunked transfer encoding and binary data.",
        "Created a real-time monitoring dashboard using Svelte and WebSockets to inspect live request/response cycles and manage server state.",
        'Implemented a "Chaos Engine" for testing frontend resilience through programmatic latency injection and configurable failure rates.',
      ],
      featured: true,
      showOnCV: true,
      published: true,
      sort: 2,
    },
    {
      title: "SandSim",
      description: "Falling sand simulation with a number of different materials and interactions between them.",
      imageURL: "https://assets.jamesmddoyle.com/sandsim.webp",
      sourceURL: "https://github.com/jmmd2000/sand-sim",
      liveURL: "https://jamesmddoyle.com/sand-sim/",
      liveLabel: "Try it",
      stack: ["Rust", "TypeScript", "React", "WebAssembly"],
      featured: true,
      published: true,
      sort: 3,
    },
    {
      title: "Issues",
      description: "An issue tracker for my personal projects, with its own MCP server.",
      imageURL: "https://assets.jamesmddoyle.com/issues.webp",
      sourceURL: "https://github.com/jmmd2000/issues",
      liveURL: "https://issues.jamesmddoyle.com",
      liveLabel: "Live site",
      stack: ["Svelte", "CSS", "Hono.js", "TypeScript"],
      featured: false,
      published: true,
      sort: 4,
    },
    {
      title: "Vintage Recreations",
      description: "Old tickets, forms and fliers rebuilt with nothing but HTML and CSS.",
      imageURL: "https://assets.jamesmddoyle.com/recreations.webp",
      sourceURL: null,
      liveURL: "https://codepen.io/jmmd2000",
      liveLabel: "CodePen",
      stack: ["HTML", "CSS"],
      featured: false,
      published: true,
      sort: 5,
    },
  ],

  currently: [
    {
      label: "Listening",
      title: "Bon Iver, Bon Iver",
      subtitle: "Bon Iver",
      url: "https://open.spotify.com/album/1JlvIsP2f6ckoa62aN7kLn",
      imageURL: "https://i.scdn.co/image/ab67616d00001e02567b0a6defc057bcbfaedadb",
      sort: 1,
    },
    {
      label: "Playing",
      title: "Fallout 4",
      subtitle: "Bethesda Game Studios",
      url: "https://store.steampowered.com/app/377160/Fallout_4/",
      imageURL: "https://cdn.cloudflare.steamstatic.com/steam/apps/377160/library_600x900.jpg",
      sort: 2,
    },
    {
      label: "Watching",
      title: "Breaking Bad",
      subtitle: "Vince Gilligan",
      url: "https://www.tvmaze.com/shows/169/breaking-bad",
      imageURL: "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg",
      sort: 3,
    },
    {
      label: "Reading",
      title: "To Kill a Mockingbird",
      subtitle: "Harper Lee",
      url: "https://openlibrary.org/isbn/9780061120084",
      imageURL: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
      sort: 4,
    },
  ],
};
