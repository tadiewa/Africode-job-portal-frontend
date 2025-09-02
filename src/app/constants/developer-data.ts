import { only } from "node:test";

export const skillsCategories = {
  "Core Programming Languages & Paradigms": [
    "Python",
    "JavaScript", 
    "TypeScript",
    "Java",
    "C++",
    "C#",
    "Go (Golang)",
    "Rust",
    "PHP",
    "Ruby",
    "Scala",
    "Swift",
    "Dart (used in Flutter)",
    "R (for data science)",
    "Elixir (functional, great for scalable apps)"
  ],
  "Frontend Engineering & Web UI": [
    "React.js",
    "Vue.js",
    "Angular",
    "Svelte",
    "Next.js (React + SSR)",
    "Nuxt.js (Vue + SSR)",
    "Tailwind CSS",
    "Bootstrap / Foundation",
    "Storybook (component libraries)",
    "Framer Motion (React animations)",
    "GSAP (GreenSock for complex animations)",
    "WebAssembly",
    "JAMstack architecture"
  ],
  "Backend & API Development": [
    "Node.js",
    "Django (Python)",
    "Flask",
    "FastAPI",
    "Express.js",
    "Spring Boot (Java)",
    "Laravel (PHP)",
    "Ruby on Rails",
    "NestJS (TypeScript backend framework)",
    "GraphQL",
    "RESTful API design",
    "gRPC",
    "Supabase (open-source Firebase alternative)",
    "Firebase Functions",
    "tRPC (end-to-end typesafe APIs)"
  ],
  "Mobile & Cross-Platform": [
    "Flutter",
    "React Native",
    "SwiftUI",
    "Jetpack Compose",
    "Ionic Framework",
    "Xamarin",
    "Native Android (Kotlin/Java)",
    "Native iOS (Swift)"
  ],
  "DevOps, Infrastructure & Site Reliability": [
    "Docker",
    "Kubernetes",
    "Terraform (IaC)",
    "AWS (EC2, Lambda, S3, etc.)",
    "Google Cloud (GCP)",
    "Azure DevOps",
    "CI/CD (GitHub Actions, CircleCI, GitLab CI)",
    "NGINX / Apache",
    "Vercel / Netlify",
    "Cloudflare (Edge functions, security)",
    "Linux Server Admin",
    "Monitoring (Prometheus, Grafana)",
    "Load Testing (k6, Artillery)"
  ],
  "AI, Data, & Automation": [
    "TensorFlow",
    "PyTorch",
    "Hugging Face Transformers",
    "LangChain / LlamaIndex (AI orchestration)",
    "OpenAI API / GPT-4 integration",
    "NLP (spaCy, NLTK)",
    "Computer Vision (YOLO, OpenCV)",
    "Data Engineering (Airflow, dbt)",
    "BigQuery / Redshift",
    "RPA (Robotic Process Automation – UIPath, Zapier, Make.com)",
    "Web scraping (Scrapy, BeautifulSoup, Puppeteer)"
  ],
  "Web3, Crypto & Decentralized Tech": [
    "Solidity",
    "Smart Contract Auditing",
    "Hardhat / Truffle / Foundry",
    "Ethereum / Polygon / Solana dev",
    "IPFS / Filecoin (decentralized storage)",
    "Wallet integration (Metamask, WalletConnect)",
    "NFT minting platforms",
    "zk-SNARKs / zero knowledge proofs (advanced cryptography)"
  ],
  "Product Design, UX/UI & No-Code": [
    "Figma (interface design + prototyping)",
    "Adobe XD",
    "UX Research & User Testing",
    "Design Systems (like Material UI, Ant Design)",
    "User Journey Mapping",
    "Wireframing (Balsamiq, Figma, Whimsical)",
    "Lottie Animations",
    "Accessibility (WCAG, ARIA)",
    "Framer (design to code)",
    "No-Code Tools (Webflow, Bubble, Glide, Softr)",
    "Tally / Typeform / Jotform",
    "Airtable / Notion as backend"
  ],
  "Miscellaneous High-Impact Skills": [
    "Git/GitHub/GitLab",
    "Agile & Scrum",
    "Jira / Linear",
    "API Documentation (Swagger, Postman)",
    "Localization & i18n",
    "SEO for developers (Lighthouse, Core Web Vitals)",
    "Chrome DevTools",
    "Progressive Web Apps (PWA)",
    "Static Site Generators (Gatsby, Hugo)",
    "Testing (Jest, Cypress, Playwright, Selenium)",
    "Headless CMS (Strapi, Sanity, Contentful)",
    "Email development (MJML, SendGrid, Mailchimp integration)",
    "Embedded systems / Arduino (for IoT devs)"
  ]
};

export const countriesInAfrica = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
  "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", 
  "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", 
  "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", 
  "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", 
  "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", 
  "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", 
  "Zambia", "Zimbabwe"
];
// developer-data.ts

export const availabilityOptions = [
  'Full-time',
  'Part-time',
  'Project-based / Contract-based',
  'Weekend only',
  'Currently Unavailable',
];
export const  experienceLevels = 
[
  'Beginner', 
  'Intermediate', 
  'Advanced', 
  'Expert'
];

export const  englishLevels = [
  'Native/Bilingual',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Basic',
];
export const  hourlyRateRanges = [

'$5-10/hour',
'$15-25/hour',
'$25-40/hour',
'$40-60/hour',
'$80+/hour',


];

 export const projectTypes = ["Web Development",
    "Mobile App",
    "Full Stack Application",
    "Frontend Development",
    "Backend Development",
    "AI/ML Project",
    "Web3/Blockchain",
    "DevOps/Infrastructure",
    "Technical Consulting",
    "Other"
  ];
  
  export const projectBudgets = ["Under $1,000",
    "$1,000 - $5,000",
    "$5,000 - $10,000",
    "$10,000 - $25,000",
    "$25,000 - $50,000",
    "$50,000+",
    "Hourly Rate"
  ];

  export const projectTimelineOptions = [ "ASAP (Rush job)",
    "1-2 weeks",
    "1 month",
    "2-3 months",
    "3-6 months",
    "6+ months",
    "Ongoing relationship"
  ];