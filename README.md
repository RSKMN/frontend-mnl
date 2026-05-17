# Quinfosys™ QuDrugForge™

Quantum AI Drug Discovery Platform  
AI-Powered Computational Molecular Intelligence

## Overview
QuDrugForge™ is a highly advanced, web-based prototype frontend for a Quantum AI Drug Discovery Platform. It demonstrates a project-centric computational research workspace tailored for oncology and molecular intelligence. It provides high-fidelity, interactive representations of structural biology, molecular properties, molecular dynamics, and quantum-assisted docking results within a premium, enterprise-grade scientific UI.

## Product Vision
The platform envisions an end-to-end computational drug discovery workflow:
- **Project-Centric Research:** Organize complex data, targets, and molecules into cohesive discovery programs (e.g., EGFR NSCLC).
- **AI/ML-Assisted Intelligence:** Surface risk predictions (ADMET), generate candidate molecules, and interpret scientific literature using a domain-specific LLM (Pharma LLM).
- **Multi-Engine Pipeline:** Support complex orchestration from classical docking (AutoDock Vina), deep-learning rescoring (GNINA), to quantum mechanical reranking and molecular dynamics simulations.
- **Enterprise SaaS Layer:** Deliver a seamless interface encompassing team governance, compute scaling, AWS integrations, and audit logging to satisfy Part 11 compliance in biopharma environments.

## Current Status
- This repository represents the **Frontend Prototype**.
- The platform uses **mock/static data** to simulate complex scientific datasets and AI responses without requiring a backend for demonstration purposes.
- **Backend APIs** (for authentication, pipeline orchestration, model inference, and data persistence) are planned for future integration.
- Actions like file uploads, API key generation, report downloads, and pipeline triggers currently utilize high-fidelity UI placeholders.

## Features

### Auth & Onboarding
- Login
- Register
- Workspace Selector

### Core
- Dashboard: High-level metrics, active pipelines, and system status.
- Research Projects: Program management and project detail workspace.
- Experiments: Comprehensive history and pipeline execution logs.
- Reports: Aggregated candidate evidence packages and dossiers.

### Research Modules
- Targets: Oncology intelligence and protein structural viewer.
- Molecules: Ligand library and property filtering.
- Docking: Classical docking setup and results evaluation.
- GNINA: Deep-learning structural rescoring.
- Quantum: QM-assisted affinity reranking metrics.
- Simulations: Molecular dynamics (MD) trajectory analysis.
- ADMET: Pharmacokinetics and toxicity risk assessment.

### Visualization
- 3D Viewer: WebGL-accelerated interactive structural visualization.
- Chemical Space: 2D UMAP embeddings of molecular libraries.
- Similarity: Structural distance indices and neighbor search.

### AI
- Pharma LLM: Literature, protocol, and workflow assistant.
- Models: AI/ML model registry and inference playground.

### Infrastructure
- Compute: Cloud cluster metrics and orchestration.
- Storage: Data buckets and storage utilization.
- API: Developer tokens and webhooks.
- Integrations: Third-party plugin bindings.

### Organization
- Team: Multi-tenant role management.
- Billing: Subscription and compute invoices.
- Audit Logs: Regulatory action tracking.
- Settings: General platform controls.

### Polish
- Robust notifications system.
- Global command palette (Cmd/Ctrl+K) for rapid navigation.
- Responsive layouts with protected tabular overflow.
- Dynamic Light/Dark theme support with biotech-inspired UI assets.

## Tech Stack
- **Framework:** React 18 / Next.js 14.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with PostCSS & Autoprefixer)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Visualization:** react-plotly.js, 3Dmol.js, Recharts, @tanstack/react-table
- **UI Utilities:** Sonner (Toast notifications), react-markdown

## Project Structure
```
src/
├── app/                  # Next.js App Router definitions
│   ├── (auth)/           # Authentication layout and routes
│   ├── (dashboard)/      # Main application layout and feature routes
│   └── globals.css       # Core design system and theme variables
├── components/           # Reusable UI architecture
│   ├── dashboard/        # Dashboard-specific components
│   ├── molecules/        # 3D visualization and chemistry components
│   ├── shared/           # Cross-functional widgets (Skeletons, States)
│   └── ui/               # Core design system components (Cards, Badges)
├── services/             # API layer and mock data providers (api.ts, mockApi.ts)
├── store/                # Zustand global state definitions
└── types/                # Shared TypeScript interfaces
```

## Getting Started

To run the application locally:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Start the production server**
   ```bash
   npm run start
   ```

## Environment Variables
The frontend prototype is designed to run seamlessly without strict environment variables using high-fidelity mock data. 
Future backend integration may utilize:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_DEMO_MODE` (Set to "false" to enforce real API connections)

## Mock Data
Mock data is heavily utilized in this prototype to demonstrate capabilities. It is handled gracefully within the `src/services/` layer (`api.ts` and `mockApi.ts`). `isDemoMode()` defaults to true, automatically intercepting network calls to serve static JSON structures representing chemical datasets, molecular properties, and simulation outputs.

## Documentation
- [UI Elements Guide](docs/UI_ELEMENTS_GUIDE.md): In-depth breakdown of components and pages.
- [User Navigation Flow](docs/USER_NAVIGATION_FLOW.md): Step-by-step beginner workflows.

## Backend Integration Roadmap
To transition this prototype to a fully functional application, the following backend integrations are planned:
- **Authentication:** Connect login, registration, and workspace selection to identity providers.
- **Projects/Workspaces:** Real persistence of research states.
- **Uploads:** Integration with S3/Blob storage for protein (PDB/FASTA) and ligand (SDF/SMILES) files.
- **Experiment Orchestration:** Async task triggering for multi-stage pipelines.
- **Docking/GNINA Services:** Dispatch computation to GPU clusters.
- **Quantum/QML Services:** Cloud-based QM evaluations.
- **ADMET Prediction:** Live inference endpoints for toxicity scoring.
- **Reports/Export:** Server-side PDF and data generation.
- **Notifications & Billing:** Real-time sockets and payment gateways.

## Development Notes
- **Theme Constraints:** Maintain existing CSS variables in `globals.css`. Avoid sweeping theme redesigns. Protect light and dark mode contrasts.
- **Layout Stability:** The sidebar and topbar should remain stable. Use `isSidebarItemActive` within `layout.tsx` for navigation mapping.
- **Components:** Prefer leveraging existing components inside `src/components/ui/` before creating new ones.
- **Data Fetching:** Keep mock logic modularized in `services/api.ts` to allow easy swapping to `fetch` calls in the future.

## Frontend E2E Testing

The frontend features a fully automated, CI-ready end-to-end testing suite written in **Playwright**.

### 1. Installation & Setup
To set up and run E2E tests locally:

1. **Install Playwright dependencies**
   ```bash
   npm install
   ```
2. **Install browser engines**
   ```bash
   npx playwright install
   ```

### 2. Running E2E Tests

Ensure your Next.js development server is running on `http://localhost:3000` (or allow Playwright's automatic web server to start it for you).

- **Run all E2E tests (Headless)**
   ```bash
   npm run test:e2e
   ```
- **Open Playwright Interactive UI**
   ```bash
   npm run test:e2e:ui
   ```
- **Run tests in Headed Mode**
   ```bash
   npm run test:e2e:headed
   ```
- **View HTML Test Reports**
   ```bash
   npm run test:e2e:report
   ```

### 3. Testing Modes

The E2E suite supports two execution modes, controlled via `.env.e2e`:

- **Mock Mode (`E2E_MODE=mock`)**: 
  - Standard baseline default. Runs entirely offline using the Next.js prototype's built-in high-fidelity mock data. No live backend services or database engines required. Extremely fast and reliable.
- **Real Mode (`E2E_MODE=real`)**:
  - Requires the `qudrugforge-backend` to be running at `http://127.0.0.1:8001`.
  - Exercises full endpoint connectivity for authentication, workspaces, target listings, file persistence, and simulations.

### 4. Troubleshooting
- **Failing on Console Errors**: Playwright tests are configured to fail on severe, unhandled Javascript exceptions. If you see console errors, check that no third-party assets are throwing syntax errors in the browser. Safe React Hydration warnings are automatically filtered.
- **Port Conflicts**: Ensure Next.js is not already bound to another port. Playwright targets `http://localhost:3000` by default.

## License
License not specified.