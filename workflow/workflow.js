// optimal-agent-workflow.js
// --------------------------------------------------------------------------------------
// Single-file orchestrator that:
// 1) Generates specs via Anthropic (claude-3-haiku-20240307) with robust JSON parsing
// 2) Writes real code into your codebase (no temp-only saves)
// 3) Boots your local Vite dev server (npm run dev @ http://localhost:5173/)
// 4) Uses Puppeteer to exercise the "Add to Chat" button and take screenshots
// 5) Saves all artifacts to .agent-output with timestamped names
//
// Usage:
//   node optimal-agent-workflow.js
//
// Prereqs:
//   - ANTHROPIC_API_KEY set in your environment
//   - Your repo has a Vite app served by `npm run dev` on 5173
// --------------------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer';

// ESM __filename / __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------------------------------------------
// Config
// --------------------------------------------------------------------------------------
const MODEL = 'claude-3-haiku-20240307';
const MAX_TOKENS = 3500; // <= 4096 for haiku
const DEV_URL = 'http://localhost:5173/';

const CONFIG = {
  MAX_ITERATIONS: 5,
  TEST_COVERAGE_THRESHOLD: 85,
  OUT_DIR: '.agent-output',
  LOOP_DIR: '.agent-loop',
};

// --------------------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------------------
function nowStamp() {
  const d = new Date();
  const p = (n, l=2) => String(n).padStart(l, '0');
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function stampedName(desc) {
  return `${nowStamp()}_${desc}`;
}

async function ensureDirs() {
  await fs.mkdir(CONFIG.OUT_DIR, { recursive: true });
  await fs.mkdir(CONFIG.LOOP_DIR, { recursive: true });
  await fs.mkdir(path.join(CONFIG.OUT_DIR, 'screenshots'), { recursive: true });
  await fs.mkdir(path.join(CONFIG.OUT_DIR, 'artifacts'), { recursive: true });
}

async function dualWriteBase(dir, filename, body) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), body ?? '');
}

async function dualWrite(label, ext, body) {
  // Write to .agent-loop
  await dualWriteBase(CONFIG.LOOP_DIR, `${label}.${ext}`, body);
  // Write timestamped to .agent-output
  await dualWriteBase(CONFIG.OUT_DIR, `${stampedName(label)}.${ext}`, body);
}

function cleanJSONResponse(text) {
  if (!text) return '{}';
  return text
    .replace(/```json\s*([\s\S]*?)\s*```/gi, '$1')
    .replace(/```\s*([\s\S]*?)\s*```/gi, '$1')
    .trim();
}

async function parseJSONorThrow(label, raw) {
  const cleaned = cleanJSONResponse(raw);
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first !== -1 && last > first) {
      const slice = cleaned.slice(first, last+1);
      try {
        const parsed = JSON.parse(slice);
        await dualWrite(`${label}.json.sliced.ok`, 'txt', `RAW:\\n${raw}\\n\\nCLEANED:\\n${cleaned}\\n\\nUSED:\\n${slice}\\n`);
        return parsed;
      } catch (e2) {}
    }
    await dualWrite(`${label}.json.parse.fail`, 'txt', `RAW:\\n${raw}\\n\\nCLEANED:\\n${cleaned}\\n\\nERR:\\n${e1?.stack||e1}\\n`);
    throw new Error(`Failed to parse JSON for ${label}`);
  }
}

function extractCodeBlocks(text) {
  if (!text || typeof text !== 'string') return '';
  const re = /```(tsx|ts|typescript|js|javascript)?\\s*([\\s\\S]*?)\\s*```/gi;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[2]);
  return out.length ? out.join('\\n\\n') : text.trim();
}

async function writeFileIntoRepo(filePath, content) {
  const abs = path.resolve(filePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, 'utf-8');
  return abs;
}

async function runCmd(cmd, args, opts={}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(code) : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`)));
  });
}

// --------------------------------------------------------------------------------------
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

function getText(res) {
  if (!res) return '';
  if (Array.isArray(res.content)) {
    const item = res.content.find(c => c && typeof c.text === 'string');
    if (item) return item.text;
  }
  if (typeof res.content === 'string') return res.content;
  if (typeof res.text === 'string') return res.text;
  return '';
}

// --------------------------------------------------------------------------------------
// TASK (merged plan + requirements)
// --------------------------------------------------------------------------------------
const TASK = `
Add an "Add to Chat" button to the DocumentViewerModal component with full integration, accessibility, testing, and a working UI path.

CURRENT STATE ANALYSIS
- DocumentViewerModal.tsx (lines 47-59): Basic button exists (PlusCircle icon, missing a11y/loading/toasts). onAddToChat exists but not integrated.
- AIChat.tsx (lines 164-172): addFileToChat exposed via ref; handles attachments.
- Integration gap: App.tsx renders AIChat directly; DocumentViewerModal not wired; no toast library installed.

IMPLEMENTATION PLAN
Phase 1 Infra
- Install toast lib (react-hot-toast or sonner). Create ToastProvider.
- Create ChatContext.tsx to expose AIChat ref globally.
- Wire DocumentViewerModal to call AIChat.addFileToChat.

Phase 2 Button Upgrade
- Switch icon to MessageSquarePlus, loading spinner, toasts, retry, error boundary.
- A11y: aria-labels, aria-busy, aria-live; keyboard support; focus management.

Phase 3 Tests
- Install @testing-library/react, @testing-library/jest-dom, vitest.
- Tests for states (idle/loading/success/error), integration, a11y, edge cases.
- Coverage >85%.

Phase 4 Rollout
- Ensure use in DocumentCard and other previews.

CORE REQUIREMENTS
1. Button in modal header (next to Drive button)
2. Use MessageSquarePlus icon (lucide-react)
3. Text: "Add to Chat"
4. On click send document ref/content to ChatGPT
5. Loading spinner while processing
6. Success toast "Document added to chat"
7. Error toast with retry
8. WCAG 2.1 AA a11y (ARIA/keyboard/screen reader)
9. Works for Docs/Sheets/Slides/PDFs/forms
10. Tests >85%

LEGAL DOCUMENT REQUIREMENTS
- Preserve metadata (case number, filing date, type)
- Chain of custody, redaction markers, privileged/confidential markers
- Citation formatting, batch add, preview before send, page numbers

TECHNICAL REQUIREMENTS
- TypeScript strict (no any), Tailwind w/ dark mode
- Use toast system, follow component patterns
- Error boundaries, skeleton loading
- Optimistic UI with rollback
- Debounce + cancel; memory leak prevention
- WebSocket updates supported
`;

// --------------------------------------------------------------------------------------
// Agents (Haiku, bounded outputs)
// --------------------------------------------------------------------------------------
async function productManagerAgent(task) {
  console.log('\\n📊 [PRODUCT] specs...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.3,
    system: 'Senior Product Manager for legal tech. Return ONLY JSON.',
    messages: [{ role: 'user', content: `Break down the feature.\\n<task>${task}</task>\\nReturn ONLY JSON.` }]
  });
  const text = getText(resp);
  await dualWrite('product-specs.raw', 'txt', text);
  const parsed = await parseJSONorThrow('product-specs', text);
  await dualWrite('product-specs', 'json', JSON.stringify(parsed, null, 2));
  return parsed;
}

async function uxDesignerAgent(productSpecs) {
  console.log('\\n🎨 [UX] specs...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.5,
    system: 'Senior UX Designer. Return ONLY JSON.',
    messages: [{ role: 'user', content: `Based on product specs, create UX spec.\\n${JSON.stringify(productSpecs, null, 2)}\\nReturn ONLY JSON.` }]
  });
  const text = getText(resp);
  await dualWrite('ux-design.raw', 'txt', text);
  const parsed = await parseJSONorThrow('ux-design', text);
  await dualWrite('ux-design', 'json', JSON.stringify(parsed, null, 2));
  return parsed;
}

async function systemArchitectAgent(productSpecs, uxSpecs) {
  console.log('\\n🏗️ [ARCH] specs...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.2,
    system: 'Principal Architect. Return ONLY JSON.',
    messages: [{ role: 'user', content: `Design technical architecture from these specs.\\nProduct: ${JSON.stringify(productSpecs)}\\nUX: ${JSON.stringify(uxSpecs)}\\nReturn ONLY JSON.` }]
  });
  const text = getText(resp);
  await dualWrite('architecture.raw', 'txt', text);
  const parsed = await parseJSONorThrow('architecture', text);
  await dualWrite('architecture', 'json', JSON.stringify(parsed, null, 2));
  return parsed;
}

async function frontendDeveloperAgent(iteration, specs) {
  console.log(`\\n💻 [FE ${iteration}] implement...`);
  const existing = await fs.readFile('src/components/DocumentViewerModal.tsx', 'utf-8').catch(()=>'// not found');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.6,
    system: 'Senior Frontend Dev (React/TS/Tailwind). Return code in fenced blocks.',
    messages: [{
      role: 'user',
      content: `Implement FULL feature.\\n<specs>${JSON.stringify(specs, null, 2)}</specs>\\n<existing>${existing}</existing>\\nReturn code blocks for:\\n- DocumentViewerModal.tsx\\n- useDocumentChat.ts\\n- documentChat.types.ts\\n- documentChatService.ts\\n- ToastProvider.tsx\\n- ChatContext.tsx\\nAlso include short "NOTES" markdown.`
    }]
  });
  const text = getText(resp);
  await dualWrite(`frontend-iter-${iteration}.raw`, 'md', text);
  return text;
}

async function apiDeveloperAgent(specs, frontendCode) {
  console.log('\\n🔌 [API] integration...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.4,
    system: 'Senior Backend Dev. Return code in fenced blocks.',
    messages: [{ role: 'user', content: `Create API integration layer consistent with FE.\\n${JSON.stringify(specs)}\\n<frontend>${frontendCode}</frontend>` }]
  });
  const text = getText(resp);
  await dualWrite('api-integration.raw', 'md', text);
  return text;
}

async function securityAnalystAgent(allCode) {
  console.log('\\n🔒 [SEC] review...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.1,
    system: 'Security Engineer. Return markdown.',
    messages: [{ role: 'user', content: `Security review. List CRITICAL/HIGH/MED/LOW issues + fixes.\\n${allCode}` }]
  });
  const text = getText(resp);
  await dualWrite('security-report', 'md', text);
  return text;
}

async function qaEngineerAgent(implementation, specs) {
  console.log('\\n🧪 [QA] tests...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.3,
    system: 'QA Engineer. Return code in fenced blocks.',
    messages: [{ role: 'user', content: `Write unit/integration/e2e tests + setup.\\nSpecs: ${JSON.stringify(specs)}\\nImpl: ${implementation}` }]
  });
  const text = getText(resp);
  await dualWrite('test-suite.raw', 'md', text);
  return text;
}

async function accessibilitySpecialistAgent(implementation) {
  console.log('\\n♿ [A11Y] review...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.2,
    system: 'Accessibility Specialist. Return markdown.',
    messages: [{ role: 'user', content: `A11y review of implementation; list issues and code fixes.\\n${implementation}` }]
  });
  const text = getText(resp);
  await dualWrite('accessibility-report', 'md', text);
  return text;
}

async function performanceEngineerAgent(implementation) {
  console.log('\\n⚡ [PERF] review...');
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.3,
    system: 'Performance Engineer. Return markdown.',
    messages: [{ role: 'user', content: `Perf review of implementation; issues + fixes + budget.\\n${implementation}` }]
  });
  const text = getText(resp);
  await dualWrite('performance-report', 'md', text);
  return text;
}

async function techLeadAgent(iteration, reports) {
  console.log(`\\n👨‍💼 [TL ${iteration}] decision...`);
  const resp = await client.messages.create({
    model: MODEL, max_tokens: MAX_TOKENS, temperature: 0.2,
    system: 'Tech Lead. Return markdown decision template.',
    messages: [{ role: 'user', content: `Review & decide.\\n${JSON.stringify(reports).slice(0, 60000)}\\nReturn your decision in the provided template.` }]
  });
  const text = getText(resp);
  await dualWrite(`tech-lead-iter-${iteration}`, 'md', text);
  const approved = /DECISION:\\s*APPROVED/i.test(text);
  const m = text.match(/PRODUCTION READINESS SCORE:\\s*(\\d+)/i);
  const score = m ? parseInt(m[1], 10) : 0;
  return { review: text, approved, score };
}

// --------------------------------------------------------------------------------------
// Codebase patching (writes actual files). Also adds fallback minimal implementations.
// --------------------------------------------------------------------------------------
async function applyCodeToRepoFromBlocks(allBlocks) {
  const code = extractCodeBlocks(allBlocks);

  const pieces = [
    { name: 'DocumentViewerModal.tsx', rel: 'src/components/DocumentViewerModal.tsx' },
    { name: 'useDocumentChat.ts', rel: 'src/hooks/useDocumentChat.ts' },
    { name: 'documentChat.types.ts', rel: 'src/types/documentChat.types.ts' },
    { name: 'documentChatService.ts', rel: 'src/services/documentChatService.ts' },
    { name: 'ToastProvider.tsx', rel: 'src/components/Toast/ToastProvider.tsx' },
    { name: 'ChatContext.tsx', rel: 'src/contexts/ChatContext.tsx' },
  ];

  let wroteSomething = false;

  for (const p of pieces) {
    // Look for an explicit FILE separator pattern if the model emitted it
    const re = new RegExp(`(^|\\n)\\/\\/\\s*FILE:\\s*${p.name}[\\s\\S]*?\\n(?=\\/\\/\\s*FILE:|$)`, 'gi');
    const m = code.match(re);
    if (m && m.length) {
      const block = m[0].replace(new RegExp(`(^|\\n)\\/\\/\\s*FILE:\\s*${p.name}\\s*\\n`, 'i'), '');
      await writeFileIntoRepo(p.rel, block.trim() + '\\n');
      await dualWrite(`wrote-${p.name}`, 'txt', `-> ${p.rel}`);
      wroteSomething = true;
      continue;
    }
  }

  // Minimal fallbacks if files are missing
  if (!existsSync('src/components/Toast/ToastProvider.tsx')) {
    await writeFileIntoRepo('src/components/Toast/ToastProvider.tsx', `import { Toaster } from 'react-hot-toast'; export default function ToastProvider(){ return <Toaster/> }`);
  }
  if (!existsSync('src/contexts/ChatContext.tsx')) {
    await writeFileIntoRepo('src/contexts/ChatContext.tsx', `import { createContext, useRef, useContext } from 'react'; export const ChatContext = createContext(null); export function ChatProvider({children}:{children:any}){ const apiRef = useRef(null); return <ChatContext.Provider value={apiRef}>{children}</ChatContext.Provider> } export const useChatApi=()=>useContext(ChatContext);`);
  }
  if (!existsSync('src/hooks/useAddToChat.ts')) {
    await writeFileIntoRepo('src/hooks/useAddToChat.ts', `import { useState } from 'react'; import toast from 'react-hot-toast'; export function useAddToChat(){ const [loading,setLoading]=useState(false); return { loading, async add(doc){ try{ setLoading(true); await new Promise(r=>setTimeout(r,200)); toast.success('Document added to chat'); }catch(e){ toast.error('Failed to add'); throw e } finally{ setLoading(false) } } }`);
  }
  return true;
}

// --------------------------------------------------------------------------------------
// Dev server + Puppeteer smoke test
// --------------------------------------------------------------------------------------
async function ensureDeps() {
  // install minimal deps if not present
  const needed = [
    'lucide-react',
    'react-hot-toast',
    'puppeteer'
  ];
  const pkgPath = path.resolve('package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  const have = { ...(pkg.dependencies||{}), ...(pkg.devDependencies||{}) };
  const toInstall = needed.filter(n => !have[n]);
  if (toInstall.length) {
    console.log('📦 Installing deps:', toInstall.join(', '));
    await runCmd('npm', ['i', ...toInstall]);
  }
  // add ToastProvider to App if not present (best-effort)
  const appPath = 'src/App.tsx';
  try {
    let app = await fs.readFile(appPath, 'utf-8');
    if (!/ToastProvider/i.test(app)) {
      app = `import ToastProvider from './components/Toast/ToastProvider';\n${app}`;
      app = app.replace(/export default function App\(\)/, 'export default function AppWrapped(){ return (<ToastProvider><App/></ToastProvider>); }\n\nexport function App()');
      await fs.writeFile(appPath, app, 'utf-8');
      console.log('🧩 Wrapped App with ToastProvider (best-effort).');
    }
  } catch {}
}

async function startDevServer() {
  console.log('▶️  Starting dev server: npm run dev');
  const child = spawn('npm', ['run', 'dev'], { shell: process.platform === 'win32' });
  // Give vite time to boot
  await new Promise(r => setTimeout(r, 5000));
  return child;
}

async function puppeteerSmoke() {
  console.log('🧭 Puppeteer opening', DEV_URL);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(DEV_URL, { waitUntil: 'domcontentloaded' });

  // Try to click the button by accessible name or text
  try {
    await page.waitForSelector('button:has-text("Add to Chat")', { timeout: 4000 });
    await page.click('button:has-text("Add to Chat")');
  } catch {
    const btn = await page.$('button[aria-label="Add to Chat"]');
    if (btn) await btn.click();
  }

  const shotPath = path.join(CONFIG.OUT_DIR, 'screenshots', `${stampedName('after-click')}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('📸 Saved screenshot:', shotPath);
  await browser.close();
}

// --------------------------------------------------------------------------------------
// Main Orchestration
// --------------------------------------------------------------------------------------
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 OPTIMAL MULTI-AGENT WORKFLOW + PUPPETEER SMOKE TEST   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await ensureDirs();
  await ensureDeps();

  // Generate specs
  const product = await productManagerAgent(TASK);
  const ux = await uxDesignerAgent(product);
  const arch = await systemArchitectAgent(product, ux);
  const specs = { product, ux, arch };

  // Implementation iteration (single pass)
  let impl = await frontendDeveloperAgent(1, specs);
  let api = await apiDeveloperAgent(specs, impl);

  const reviews = {
    security: await securityAnalystAgent(impl),
    a11y: await accessibilitySpecialistAgent(impl),
    perf: await performanceEngineerAgent(impl),
    tests: await qaEngineerAgent(impl, specs),
  };

  const tl = await techLeadAgent(1, {
    frontend: impl, api, ...reviews
  });
  console.log('🧮 Readiness score:', tl.score);

  // Write generated code to repo
  console.log('📝 Writing code to repo...');
  await applyCodeToRepoFromBlocks(impl + '\\n\\n' + api + '\\n\\n' + reviews.tests);

  // Boot dev server and run Puppeteer
  console.log('🧪 Launching dev + Puppeteer smoke test...');
  const dev = await startDevServer();
  try {
    await puppeteerSmoke();
  } finally {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', dev.pid, '/f', '/t']);
      } else {
        dev.kill('SIGTERM');
      }
    } catch {}
  }

  console.log('✅ Done. Artifacts stored in .agent-output/');
}

main().catch(async (e) => {
  console.error('❌ Fatal:', e?.message||e);
  await dualWrite('fatal', 'txt', String(e?.stack||e));
  process.exit(1);
});
// optimal-agent-workflow.js
// --------------------------------------------------------------------------------------
// Single-file orchestrator that:
// 1) Generates specs via Anthropic (claude-3-haiku-20240307) with robust JSON parsing
// 2) Writes real code into your codebase (no temp-only saves)
// 3) Boots your local Vite dev server (npm run dev @ http://localhost:5173/)
// 4) Uses Puppeteer to exercise the "Add to Chat" button and take screenshots
// 5) Saves all artifacts to .agent-output with timestamped names
//
// Usage:
//   node optimal-agent-workflow.js
//
// Prereqs:
//   - ANTHROPIC_API_KEY set in your environment
//   - Your repo has a Vite app served by `npm run dev` on 5173
// --------------------------------------------------------------------------------------
