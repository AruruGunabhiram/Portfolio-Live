# Gunabhiram Aruru

## Professional Profile

* **Name:** Gunabhiram Aruru
* **Current academic position:** M.S. Computer Science student at the University of Colorado Boulder
* **Expected graduation:** May 2027
* **Current professional role:** AI Specialist Intern at PROJXON
* **University leadership:** President of Outreach, Graduate and Professional Student Government (GPSG), University of Colorado Boulder
* **Professional focus:** Software engineering across backend systems, full-stack applications, AI-integrated systems, automation, and agentic workflows.
* **Primary engineering areas:** Backend engineering, AI/LLM applications, agent systems, APIs, data pipelines, full-stack development, workflow automation, cloud architecture, and reliability-focused software.
* **Career interests:** Software engineering roles involving backend systems, applied AI, AI infrastructure, agentic systems, full-stack products, developer platforms, and ML/AI-enabled applications.
* **Target roles:** Software Engineer, Backend Software Engineer, Full-Stack Software Engineer, Applied AI Engineer, AI Software Engineer, and related AI/ML platform engineering roles.

## Education

### University of Colorado Boulder

* **Degree:** Master of Science in Computer Science
* **Dates:** August 2025 - May 2027
* **Status:** In progress
* **Expected graduation:** May 2027
* Academic interests include software systems, AI, language models, backend engineering, and applied computer science.
* Relevant studied areas include language models / natural language processing and computer graphics.

### SRM University

* **Degree:** Bachelor of Science in Computer Science
* **Dates:** August 2021 - May 2025
* Developed a foundation in programming, algorithms, object-oriented programming, software development, databases, and computer science fundamentals.
* C and C++ were used primarily as part of academic and problem-solving work.

## Professional Experience

### PROJXON

* **Role:** AI Specialist Intern
* **Dates:** June 2026 - Present
* **Work arrangement:** Remote
* Works on AI-enabled internal systems, workflow automation, data-processing tools, and software supporting business operations.

#### OrkaATS

* Contributed to the development of an internal recruiting and applicant workflow system.
* Built around Google Apps Script and Google Sheets.
* Implemented structured candidate intake, stable identifiers, recruiter-facing views, workflow controls, filtering, candidate cards, checklists, links, and two-way dashboard/sheet synchronization.
* The system uses a controlled workflow with **14 candidate states**.
* An internal pilot involved **6 recruiters and 72 candidate records**.
* Work emphasized usability, deterministic workflow behavior, validation, and operational reliability.

#### PROJXON Monitor

* Built a scheduled web-mention monitoring and reporting prototype.
* Uses **Python, PostgreSQL, SQLAlchemy, Alembic, SerpAPI, trafilatura / BeautifulSoup, VADER, GitHub Actions, and reporting automation**.
* Searches configured web queries, fetches source content, deduplicates results, performs bounded sentiment analysis, preserves evidence, stores results, and generates reports.
* Supports HTML, CSV, and PDF reporting and optional workspace delivery.
* Designed as a scheduled evidence-preserving monitoring pipeline rather than a real-time social-listening or autonomous-agent product.
* Recent project validation included **353 automated tests**.
* Evaluated runs included 11 configured searches and reporting across repeated monitoring runs.

#### OrkaFin

* Worked on the architecture and product design for a permission-aware AI layer associated with recruiting workflows.
* Designed concepts around:

  * source-grounded responses
  * deterministic authority boundaries
  * permission checks
  * confirmation before sensitive actions
  * redaction
  * auditability
  * feedback
  * QA and security controls
* A locally runnable prototype using synthetic recruiting data was created.
* The prototype should not be described as a production deployment or autonomous financial/recruiting agent.

#### Other Engineering Work

* Worked with Python automation and validation pipelines.
* Contributed to API-connected AI workflows and internal software prototypes.
* Applied deterministic validation and approval boundaries around AI-assisted behavior.
* Worked with GitHub-based development and automated testing practices.

### InfiniAI Technologies Pvt. Ltd.

* **Role:** Software Engineer Intern
* **Dates:** August 2024 - January 2025
* **Location:** Hyderabad, India
* Worked on backend software, Python automation, AI-integrated applications, and web development.
* Built or contributed to:

  * Python automation and data-processing pipelines
  * REST API integrations
  * AI-related internal projects
  * a Flask-based full-stack web application
* Primary verified technologies include **Python, Flask, REST APIs, and web application development**.
* Collaborated with other engineers on multiple AI-oriented projects.

## Projects

### Ember / Worthy

* **Ownership:** Personal / solo project
* **Status:** Active development
* **Type:** Personal AI execution and job-search assistant

**Worthy** is the assistant-facing identity of the system, while **Ember** refers to the underlying engineering platform.

The system is designed to perform useful job-search and personal-assistant workflows while keeping consequential actions bounded by deterministic policies and human approval.

#### Architecture

* Python
* FastAPI
* Uvicorn
* asyncio
* Pydantic
* SQLAlchemy
* Alembic
* SQLite
* local artifact storage
* provider-based LLM integration
* durable orchestrator and worker architecture
* scheduled/background execution

#### Engineering Features

* proposal -> approval -> execution -> audit workflow
* deterministic permission and policy enforcement
* human-in-the-loop approvals
* pause and resume
* task recovery
* durable state
* dry-run execution
* audit logging
* cost and model-call budget controls
* capability routing
* job ingestion and normalization
* deterministic job filtering
* job-fit intelligence
* evidence-aware scoring
* resume and application preparation workflows
* duplicate and idempotency protections

#### Integrations

Adapters or workflows have been developed around:

* Greenhouse
* Google Drive
* Gmail
* Google Calendar
* Telegram

LLMs are intentionally limited to semantic/reasoning tasks where appropriate. Operational state, permissions, safety decisions, and other deterministic decisions are handled in code.

Recent acceptance work reported **4,211 passing automated tests** across the system.

Ember/Worthy should not be represented as a fully autonomous production system. Human approval and deterministic policy boundaries are core design principles.

### IncidentPilot

* **Ownership:** Solo project
* **Type:** AI-assisted incident investigation system
* **Primary technologies:** Python, FastAPI, Pydantic, Gemini API

IncidentPilot helps investigate software incidents using available evidence and produces structured analysis of likely causes and remediation options.

#### Features

* evidence-grounded incident analysis
* evidence citations and provenance
* root-cause analysis workflows
* remediation planning
* input and output validation
* sensitive-data redaction
* safety gates
* human approval
* dry-run execution for actions
* protection against unsupported autonomous remediation

The project has been validated with approximately **438 automated tests**.

### SocialLens

* **Ownership:** Solo project
* **Type:** YouTube analytics and data platform
* **Primary technologies:** Java, Spring Boot, React, TypeScript, PostgreSQL, Flyway, OAuth 2.0, Docker

SocialLens collects YouTube data over time and turns it into historical analytics rather than relying only on current API snapshots.

#### Architecture and Features

* YouTube API integration
* OAuth 2.0 authentication
* Spring Boot backend
* REST APIs
* PostgreSQL persistence
* Flyway database migrations
* scheduled synchronization
* incremental ingestion
* historical snapshots
* analytics and trend views
* retry handling
* API quota-aware processing
* React / TypeScript frontend

The project has substantial automated backend and frontend test coverage.

SocialLens should currently be described as a **YouTube-focused analytics platform**. Claims about Instagram, Reddit, generalized social listening, or broad sentiment monitoring should not be made without additional evidence.

### Clinical Reconciliation

* **Ownership:** Solo project
* **Type:** AI-assisted clinical-record reconciliation prototype
* **Primary technologies:** Python, FastAPI, React, Supabase / PostgreSQL, Anthropic Claude

Clinical Reconciliation compares structured clinical information and helps surface discrepancies that may require human review.

#### Features

* record comparison
* discrepancy detection
* confidence scoring
* structured AI-assisted reasoning
* deterministic validation
* human approve/reject workflow
* authentication
* caching
* deterministic fallback behavior

Recent repository validation included **55 passing backend tests**.

The project is an engineering prototype. It should not be presented as providing medical diagnosis, clinical outcomes, regulatory compliance, or autonomous medical decisions.

### Code Battlegrounds

* **Ownership:** Collaborative team project
* **Type:** Real-time collaborative coding platform
* **Primary technologies:** React, TypeScript, Node.js, Express, Socket.IO, Supabase / PostgreSQL, Judge0, Gemini, ElevenLabs, OAuth

Code Battlegrounds combines collaborative programming with code execution and AI-assisted learning features.

#### Features

* real-time collaborative editing
* Socket.IO-based synchronization
* remote code execution through Judge0
* Gemini-powered coding assistance / hints
* ElevenLabs-powered voice interaction for mock-interview functionality
* authentication
* shared application state
* PostgreSQL-backed data through Supabase

Gunabhiram contributed to a shared team repository. It should not be represented as a solo project, and individual component ownership should not be inferred beyond verified contributions.

### Zenco

* **Ownership:** Collaborative class project
* **Type:** Developer tooling / VS Code extension project
* **Technologies:** TypeScript, Python, VS Code API, object-oriented design

Zenco explores a plugin-style architecture in which editor integrations communicate with interchangeable processing engines through stable interfaces.

Gunabhiram's verified contribution focused on **VS Code extension integration**, including connecting the Python command-line workflow to editor functionality.

The underlying Python engine was collaborative work and should not be presented as solely authored by Gunabhiram.

### Nostalgia

* **Ownership:** Co-built with a collaborator
* **Type:** Browser extension
* **Technologies:** React, TypeScript, SCSS, Chrome Extension APIs, `chrome.storage.local`

Nostalgia provides a lightweight way to capture, save, and locally reuse content through a browser extension.

The project uses local browser storage rather than requiring a cloud backend.

It should be described as a collaborative project.

## AI / Agent Engineering

Gunabhiram's AI engineering work focuses on combining language models with deterministic software rather than delegating entire systems to an LLM.

### Demonstrated Areas

* LLM-integrated software
* agent and orchestrator architectures
* model-provider abstraction
* structured AI outputs
* evidence grounding
* deterministic validation
* safety and policy boundaries
* tool execution
* permission-aware workflows
* human-in-the-loop approval
* dry-run modes
* audit trails
* cost controls
* workflow automation
* retry and recovery logic
* source provenance
* prompt-injection-aware workflow design

### Project Evidence

* **Ember/Worthy:** durable orchestration, deterministic policy enforcement, bounded LLM reasoning, human approvals, tools, job workflows, model budgeting, audit trails.
* **IncidentPilot:** evidence-grounded Gemini analysis with redaction, safety gates, approvals, and dry-run actions.
* **Clinical Reconciliation:** Claude-assisted structured comparison with deterministic validation and human review.
* **OrkaFin:** permission-aware and source-grounded AI prototype with confirmation and audit boundaries.
* **Code Battlegrounds:** Gemini-assisted coding features and ElevenLabs-based voice interaction.
* **PROJXON work:** AI-enabled workflow automation and controlled internal prototypes.

RAG has appeared in prior skill descriptions, but a sufficiently well-evidenced flagship implementation is not currently established for this authoritative file. Ask Guna should not imply deep production RAG experience without additional verified project evidence.

## Backend Engineering

Verified backend experience includes:

* **Python**

  * FastAPI
  * Flask
  * Pydantic
  * SQLAlchemy
  * async application development
  * automation pipelines
  * background workflows
  * API integrations

* **Java**

  * Spring Boot
  * REST API development
  * scheduled data synchronization
  * database-backed services

* **Node.js / Express**

  * collaborative real-time application development in Code Battlegrounds

### Backend Engineering Areas

* REST APIs
* OAuth-based integrations
* authentication and authorization concepts
* input validation
* database modeling
* schema migrations
* scheduled jobs
* asynchronous workflows
* retry handling
* idempotent processing
* background automation
* external API integrations
* auditability
* deterministic business rules
* automated testing

## Frontend / Full Stack

Verified frontend and full-stack experience includes:

* React
* TypeScript
* JavaScript
* HTML / CSS-based web interfaces
* Chrome Extension APIs
* VS Code Extension APIs

### Project Examples

* **SocialLens:** React / TypeScript analytics frontend connected to a Spring Boot backend.
* **Clinical Reconciliation:** React frontend connected to a FastAPI backend.
* **Code Battlegrounds:** React / TypeScript real-time collaborative interface.
* **Nostalgia:** React / TypeScript browser extension.
* **Zenco:** TypeScript VS Code extension integration.
* **InfiniAI:** Flask-based full-stack web application.

## Databases, Cloud, DevOps and Infrastructure

### Databases

Verified project experience includes:

* PostgreSQL
* SQLite
* Supabase / PostgreSQL
* SQLAlchemy
* Flyway
* Alembic
* Neon-hosted PostgreSQL

Examples:

* SocialLens uses PostgreSQL and Flyway.
* Ember uses SQLite, SQLAlchemy, and Alembic.
* PROJXON Monitor uses PostgreSQL, SQLAlchemy, and Alembic.
* Clinical Reconciliation uses Supabase / PostgreSQL.
* Code Battlegrounds uses Supabase / PostgreSQL.

### Cloud

* AWS architecture knowledge backed by the AWS Certified Solutions Architect - Associate certification.
* Project-level experience with cloud-hosted services and cloud-oriented application architecture.
* Experience using hosted databases and external cloud APIs.

AWS should be described accurately as certification-backed architecture knowledge plus project-level engineering experience, not as evidence of operating very large production AWS environments.

### DevOps and Infrastructure

* Docker
* Git
* GitHub
* GitHub Actions
* CI/CD workflows
* database migrations
* scheduled automation
* environment configuration
* automated testing

GitHub Actions has been used for testing and scheduled workflows, including project automation.

## Complete Technical Skills

### Languages

* Python
* Java
* TypeScript
* JavaScript
* SQL
* C
* C++

### AI / LLM

* LLM application integration
* Gemini API
* Anthropic Claude
* model-provider abstractions
* structured AI outputs
* evidence grounding
* deterministic validation
* AI guardrails
* human-in-the-loop workflows
* approval-gated AI actions
* agent/orchestrator systems
* prompt-injection-aware workflow design

### Backend

* FastAPI
* Spring Boot
* Flask
* Node.js
* Express
* REST APIs
* Pydantic
* SQLAlchemy
* OAuth 2.0
* asynchronous Python
* background and scheduled jobs

### Frontend

* React
* TypeScript
* JavaScript
* Chrome Extension APIs
* VS Code Extension APIs

### Databases

* PostgreSQL
* SQLite
* Supabase
* Neon PostgreSQL
* SQLAlchemy
* Flyway
* Alembic

### Cloud

* AWS
* cloud architecture fundamentals
* hosted database services
* cloud API integrations

### DevOps

* Docker
* Git
* GitHub
* GitHub Actions
* CI/CD
* automated migrations
* scheduled workflows

### Automation

* Python automation
* Google Apps Script
* GitHub Actions scheduling
* API-driven workflows
* data ingestion pipelines
* validation pipelines
* automated reporting

### Testing

* pytest
* pytest-asyncio
* HTTPX-based API testing
* backend integration testing
* workflow and policy testing
* deterministic regression testing
* frontend and full-stack automated testing

### Tools and Integrations

* Google Apps Script
* Google Sheets
* SerpAPI
* Judge0
* Gemini
* Anthropic Claude
* ElevenLabs
* Greenhouse integrations
* Google Drive integrations
* Gmail integrations
* Google Calendar integrations
* Telegram integrations
* VS Code API

## Certifications

### AWS Certified Solutions Architect - Associate

* **Issuer:** Amazon Web Services (AWS)
* **Exam:** SAA-C03
* **Issued:** August 30, 2026
* **Score:** 915 / 1000
* Demonstrates knowledge of designing secure, resilient, high-performing, and cost-aware architectures on AWS.

## Research and Publications

### Computer Aided Diagnosis Multi-Model System using Late Fusion and Ensemble Learning

* **Publisher / venue information currently verified:** IEEE
* **Year:** 2025
* The work concerns computer-aided diagnosis using multiple models combined through late-fusion and ensemble-learning techniques.
* Exact conference or journal name, DOI, author-specific contribution, and detailed experimental methodology are not sufficiently verified in the current knowledge.

No other research publication is confidently established enough to list as an authoritative publication.

## Leadership and University Activities

### Graduate and Professional Student Government, University of Colorado Boulder

* **Role:** President of Outreach
* **Dates:** April 2026 - Present
* Supports outreach and communication for CU Boulder's graduate and professional student community.
* Helps connect students with GPSG activities, information, resources, and opportunities.
* Participates in university-level graduate and professional student leadership.

Private GPSG discussions, internal meeting details, political deliberations, and confidential university communications are outside the scope of Ask Guna.

## Achievements

* Earned the **AWS Certified Solutions Architect - Associate (SAA-C03)** certification with a score of **915 / 1000**.
* Published research with IEEE in 2025 on a computer-aided diagnosis multi-model system using late fusion and ensemble learning.
* Elected / serving as **President of Outreach for CU Boulder GPSG** beginning April 2026.
* Developed an internal OrkaATS pilot used with **6 recruiters and 72 candidate records**.
* Built multiple substantial software systems spanning backend engineering, AI-integrated workflows, full-stack applications, developer tooling, and automation.

## Career Interests

Gunabhiram is primarily interested in roles where software engineering intersects with reliable AI-enabled systems.

Strong matches include:

* Software Engineer
* Backend Software Engineer
* Full-Stack Software Engineer
* Applied AI Engineer
* AI Software Engineer
* AI Systems Engineer
* AI / ML Platform Engineer
* Developer-platform or automation engineering roles

Areas of particular interest include:

* backend architecture
* APIs and distributed application workflows
* AI-integrated products
* agents and tool-using systems
* deterministic and approval-gated AI
* data pipelines
* workflow automation
* cloud-backed applications
* reliable production-oriented software

## Work Authorization

* Gunabhiram is an international student in the United States in **F-1 student status**.
* He has used **Curricular Practical Training (CPT)** authorization for internship employment while enrolled at CU Boulder.
* His M.S. Computer Science program is expected to finish in **May 2027**.
* Exact post-graduation OPT, STEM OPT, and long-term employer-sponsorship details should not be stated by Ask Guna until they are explicitly verified for public use.

Do not expose immigration-document numbers, SEVIS information, passport information, visa numbers, I-20 information, or other immigration records.

## Public Professional Contact

* **Portfolio:** https://gunabhiram.com
* **GitHub:** https://github.com/AruruGunabhiram
* **LinkedIn:** https://www.linkedin.com/in/gunabhiram-aruru/
* **Professional email:** [gunabhiram.a@gmail.com](mailto:gunabhiram.a@gmail.com)

Do not expose a home address, personal phone number, student identifiers, or private contact information.

## Questions Ask Guna Should Be Able to Answer

Using this knowledge base, Ask Guna should be able to answer questions about:

* who Gunabhiram Aruru is
* his current M.S. Computer Science program at CU Boulder
* his expected May 2027 graduation
* his backend, full-stack, and AI engineering focus
* his PROJXON AI Specialist internship
* his work on OrkaATS, PROJXON Monitor, and OrkaFin
* his InfiniAI software engineering internship
* his Python and Java experience
* his FastAPI and Spring Boot experience
* his React / TypeScript experience
* his PostgreSQL and SQLite experience
* his AI and agent engineering work
* Ember / Worthy
* IncidentPilot
* SocialLens
* Clinical Reconciliation
* Code Battlegrounds
* Zenco
* Nostalgia
* his AWS certification
* his AWS architecture knowledge
* his IEEE research publication
* his GPSG leadership role
* his technical skills
* the types of engineering roles he is targeting
* his current F-1 / CPT work-authorization context
* his public portfolio, GitHub, LinkedIn, and professional email

If a visitor asks for information that is not established in this file, Ask Guna should say that the information is not currently available rather than infer or manufacture an answer.

## Information to Verify

* **TimeSling:** Previous portfolio material described TimeSling as a native macOS menu-bar timer application with multiple timers, presets, stacking, completion notifications, and no Dock presence. A later repository audit found conflicting ownership / contribution evidence. Do not present TimeSling as Gunabhiram's project until ownership and his exact contribution are verified.
* **Extinction:** Extinction has appeared in earlier project inventories, but no reliable matching repository or sufficiently verified project description is currently available. Do not make claims about it until its identity, purpose, technologies, ownership, and contribution are verified.
* **InfiniAI dates:** The current working timeline is August 2024 - January 2025, but older portfolio artifacts contained inconsistent ranges. Confirm against the final public resume before treating the dates as immutable.
* **Code Battlegrounds contribution boundaries:** The project is verified as collaborative, but exact component-by-component authorship should be verified before making more specific personal-ownership claims.
* **Publication metadata:** Verify the exact IEEE conference or journal name, complete author list, DOI / paper URL, and Gunabhiram's precise contribution to "Computer Aided Diagnosis Multi-Model System using Late Fusion and Ensemble Learning."
* **Additional leadership:** A prior reference indicates involvement in an SRM DSA Club, but the exact role title, responsibilities, and dates are not sufficiently established for the authoritative public knowledge base.
* **OPT / STEM OPT / sponsorship:** Confirm post-completion OPT eligibility, STEM OPT eligibility, and the precise answer to future-employer-sponsorship questions before publishing them as facts.
* **RAG:** RAG appears in previous skill and resume material, but a concrete current flagship implementation has not been established strongly enough for this file.
* **Additional technologies:** GCP, Flutter, Vite, Next.js, Django, Kubernetes, MySQL, MongoDB, Redis, and AWS Aurora have appeared in prior resume or technical-stack material, but recent project-specific evidence is insufficient to represent them here as demonstrated current strengths without verification.
* **LangChain / LangGraph / vector databases:** These technologies have appeared in discussions and learning/planning contexts, but implemented production or portfolio evidence is insufficient. Do not claim them as demonstrated project experience without verification.
* **Individual project URLs:** Exact public repository and live-demo URLs for the individual projects should be added only after confirming which repositories are public and intended to be linked from the portfolio.
