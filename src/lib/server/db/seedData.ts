import type { education, experience, profile, projects, skills, socials } from "./schema";

interface SeedData {
  profile: typeof profile.$inferInsert;
  socials: (typeof socials.$inferInsert)[];
  experience: (typeof experience.$inferInsert)[];
  skills: (typeof skills.$inferInsert)[];
  education: (typeof education.$inferInsert)[];
  projects: (typeof projects.$inferInsert)[];
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
    { name: "Email", url: "mailto:jamesmddoyle@gmail.com", sort: 3 },
  ],

  experience: [
    {
      title: "Software Engineer",
      company: "Ericsson",
      logoURL: "https://assets.jamesmddoyle.com/ericsson-vZu3qlLA.png",
      startDate: "2023-07-01",
      endDate: null,
      bullets: [
        "Serve as test lead for a team of 8 to 14 engineers, defining test strategy, coordinating test efforts, and helping ensure release quality for a microservice in a large-scale telecom platform.",
        "Develop and maintain a containerised PostgreSQL database deployed using Helm and Kubernetes, as part of a large-scale telecom management platform.",
        "Build and maintain 6 Jenkins pipelines that support the team's CI/CD workflows across development and testing.",
        "Lead the team's work on a product-wide benchmarking tool, building performance testing capabilities used in customer environments to assess whether hardware can support the wider product.",
        "Reorganised a Confluence space containing hundreds of pages and wrote operational guides for heartbeat activities, test processes, and onboarding, improving access to team documentation.",
      ],
      tags: ["Kubernetes", "PostgreSQL", "Python", "Go", "Helm", "Jenkins"],
      sort: 1,
    },
    {
      title: "Frontend Intern",
      company: "Fusio",
      logoURL: "https://assets.jamesmddoyle.com/fusio-eV2UCMog.png",
      startDate: "2022-01-01",
      endDate: "2022-07-01",
      bullets: [
        "Responded to customer queries via email to address issues and resolve complaints.",
        "Maintained content for client websites via CMS or by editing raw HTML files.",
        "Designed and implemented website interfaces for mobile, desktop, and tablets.",
      ],
      tags: ["HTML", "CSS", "JavaScript", "WordPress"],
      sort: 2,
    },
  ],

  skills: [
    { category: "Frontend", items: ["HTML", "CSS", "React", "TypeScript", "Svelte"], sort: 1 },
    { category: "Backend & Data", items: ["Node", "PostgreSQL"], sort: 2 },
    { category: "DevOps & CI/CD", items: ["Docker", "Kubernetes", "Helm", "Jenkins"], sort: 3 },
    { category: "Languages", items: ["TypeScript", "Python", "Go", "Rust", "Java", "C#"], sort: 4 },
  ],

  education: [
    { degree: "BSc Computer Science & Software Engineering", institution: "Maynooth University", grade: "2.1 Honours", startYear: 2019, endYear: 2023, sort: 1 },
    { degree: "QQI Level 5 Computer Systems and Networks", institution: "Dunboyne College of Further Education", grade: "Full Honours", startYear: 2018, endYear: 2019, sort: 2 },
  ],

  projects: [
    {
      title: "JamesReviewsMusic",
      description: "Full-stack music blog using the Spotify API for album, track, and artist data.",
      imageURL: "https://assets.jamesmddoyle.com/jrm.webp",
      sourceURL: "https://github.com/jmmd2000/album-review-fullstack",
      liveURL: "https://jamesreviewsmusic.com/",
      liveLabel: "Live site",
      stack: ["React", "Express.js", "TypeScript", "TailwindCSS", "Spotify API"],
      featured: true,
      published: true,
      sort: 1,
    },
    {
      title: "Phantom",
      description: "A low-level API mocker and traffic inspector that includes a built in dashboard for real-time monitoring and route configuration.",
      imageURL: "https://assets.jamesmddoyle.com/phantom.webp",
      sourceURL: "https://github.com/jmmd2000/phantom",
      liveURL: "https://www.npmjs.com/package/@jamesmddoyle/phantom",
      liveLabel: "npm",
      stack: ["TypeScript", "Svelte", "Node.js"],
      featured: true,
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
      description: "Pure HTML and CSS recreations of random documents, fliers and cards, a fun exercise.",
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
};
