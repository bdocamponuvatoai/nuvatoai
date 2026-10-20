export const services = [
  {
    id: 'websites',
    name: 'Websites',
    title: 'Built new, or fixed properly.',
    description:
      'A new website, a thoughtful redesign, or a proper fix for the site you already have.',
    items: [
      'New builds and redesigns',
      'Website audits and repairs',
      'Performance, SEO, and security',
      'Updates, content, and ongoing maintenance',
      'Optional on-site AI assistant',
    ],
    tags: ['Design & build', 'Redesign', 'Maintenance'],
    cta: 'Talk about your site',
  },
  {
    id: 'ai-agents',
    name: 'AI agents',
    title: 'Agents that execute, not just answer.',
    description:
      'Start with a ready-made agent or scope a custom build in 2–4 weeks. Define permissions and human approval gates before it goes to work.',
    items: [
      'Production agent catalog',
      'Custom agent builds',
      'Permission-based access',
      'Human approval gates',
      'On-site AI assistants',
    ],
    tags: ['Ready-made', 'Custom builds', 'On-site assistant'],
    cta: 'Deploy this agent',
  },
  {
    id: 'automation',
    name: 'Automation',
    title: 'Less handoff. More flow.',
    description:
      'Connect the tools you already run and remove the manual handoffs between them, end to end.',
    items: [
      'Two-way data synchronization',
      'Triggered tasks across your tools',
      'Approval workflows',
      'Execution logs and visibility',
    ],
    tags: ['Integrations', 'Data sync', 'Approvals'],
    cta: 'Automate a workflow',
  },
  {
    id: 'documentation',
    name: 'SOPs & workflow documentation',
    title: 'Good work. Clearly documented.',
    description:
      'Capture how the work actually gets done, then turn it into clear, current, usable documentation.',
    items: [
      'Process discovery and mapping',
      'SOPs with clear owners',
      'Training and handover materials',
      'Version control',
      'A blueprint for future automation',
    ],
    tags: ['Process mapping', 'SOP writing', 'Training'],
    cta: 'Document a process',
  },
  {
    id: 'platforms',
    name: 'Enterprise platform development',
    title: 'Built around your operation.',
    description:
      'Custom internal platforms, portals, and dashboards built to your governance, scale, and security needs.',
    items: [
      'Internal tools and portals',
      'Admin workflows and reporting',
      'Single sign-on',
      'Audit logs and permissions',
    ],
    tags: ['Internal tools', 'Portals', 'Dashboards'],
    cta: 'Scope a platform',
  },
] as const;
export const agents = [
  {
    name: 'Lead Qualifier',
    category: 'Sales',
    description:
      'Scores inbound leads, enriches records, and routes the hot ones to the right rep within seconds.',
    tools: ['HubSpot', 'Salesforce', 'Gmail'],
    featured: true,
  },
  {
    name: 'Pipeline Updater',
    category: 'Sales',
    description:
      'Keeps your CRM clean — logs activity, advances deal stages, and flags stalled opportunities.',
    tools: ['Salesforce', 'Slack'],
  },
  {
    name: 'Proposal Follow-up',
    category: 'Sales',
    description:
      'Tracks sent proposals and sends timed, personalized nudges until the deal moves or closes.',
    tools: ['Gmail'],
  },
  {
    name: 'Task Router',
    category: 'Operations',
    description: 'Routes incoming tasks to the appropriate team or owner.',
    tools: [],
    review: true,
  },
  {
    name: 'Onboarding Coordinator',
    category: 'Operations',
    description: 'Coordinates the steps and tasks in an onboarding process.',
    tools: [],
    review: true,
  },
  {
    name: 'Vendor Tracker',
    category: 'Operations',
    description: 'Keeps vendor information and related tasks organized.',
    tools: [],
    review: true,
  },
  {
    name: 'Invoice Chaser',
    category: 'Finance',
    description: 'Follows up on invoices that need attention.',
    tools: [],
    review: true,
  },
  {
    name: 'Collections Reminder',
    category: 'Finance',
    description: 'Organizes reminders for outstanding collections.',
    tools: [],
    review: true,
  },
  {
    name: 'Expense Reconciler',
    category: 'Finance',
    description: 'Helps reconcile expenses against their records.',
    tools: [],
    review: true,
  },
  {
    name: 'Ticket Triage',
    category: 'Support',
    description: 'Sorts incoming support tickets for review and routing.',
    tools: [],
    review: true,
  },
  {
    name: 'Knowledge Responder',
    category: 'Support',
    description: 'Uses an approved knowledge base to prepare responses.',
    tools: [],
    review: true,
  },
  {
    name: 'CSAT Follow-up',
    category: 'Support',
    description: 'Follows up on customer satisfaction feedback.',
    tools: [],
    review: true,
  },
];
export const processSteps = [
  {
    title: 'Discover & scope',
    description:
      'Map the work, the people, and the systems. Agree on a clear scope and fixed price before work starts.',
  },
  {
    title: 'Design & build',
    description: 'Design the experience and build the system around the way your business works.',
  },
  {
    title: 'Test & hand over',
    description: 'Test real workflows, document the details, and give your team a clear handover.',
  },
  {
    title: 'Measure & maintain',
    description: 'Review how the system performs, keep it current, and improve what comes next.',
  },
];
export const faqs = [
  {
    question: 'What does Nuvato AI build?',
    answer:
      'We build websites, AI agents, automations, SOPs and workflow documentation, and custom enterprise platforms. Each engagement starts by understanding the work you need the system to do.',
  },
  {
    question: 'Can we start with one service?',
    answer:
      'Yes. Take one service, or combine several. A documented process makes a better automation, and a better automation makes a smarter agent. We scope the combination around your needs.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'Every engagement is scoped first, with a fixed price agreed before work starts. The price depends on the deliverables, systems, and requirements we agree together.',
  },
  {
    question: 'How long does a custom agent take?',
    answer:
      'Custom agent builds are typically scoped for 2–4 weeks. The agreed scope, integrations, access, and review requirements determine the actual schedule.',
  },
  {
    question: 'How do approvals and permissions work?',
    answer:
      'Permissions define what a system can access. Human approval gates define which actions need review before they run. Run logs and audit trails make activity visible; SSO can be included where the platform and scope support it.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'We document and hand over the work, then measure and maintain it within the agreed scope. Website updates, platform maintenance, and workflow improvements can be included in your engagement.',
  },
];
export const toolNames = [
  'HubSpot',
  'Salesforce',
  'Gmail',
  'Slack',
  'Asana',
  'Notion',
  'Calendar',
  'Sheets',
  'QuickBooks',
  'Stripe',
  'Xero',
  'Zendesk',
  'Intercom',
  'DocuSign',
];

export const agentFragment = (name: string) =>
  'agent-' +
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-$/, '');
export const agentSummary =
  'Nuvato AI agents handle defined tasks across sales, operations, finance, and support — with scoped permissions, human approval gates, and a record of what ran.';
export const agentStory = [
  {
    label: 'DEFINE THE JOB',
    title: 'Give it a clear scope.',
    description:
      'Start with one task and the tools it needs. Define what the agent can read, what it can change, and where the work begins.',
    detail: 'Access matched to the work',
  },
  {
    label: 'KEEP THE DECISION',
    title: 'You set the boundaries.',
    description:
      'Use human approval gates for sensitive actions. The agent prepares the work; the agreed controls determine what can happen next.',
    detail: 'Human review before sensitive actions',
  },
  {
    label: 'FOLLOW THE WORK',
    title: 'See what happened.',
    description:
      'Follow the run from its trigger through the approved action. Readable logs give your team a record to review and maintain.',
    detail: 'Activity your team can trace',
  },
] as const;
