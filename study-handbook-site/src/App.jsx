import { useEffect, useMemo, useState } from 'react';

import { ASTGraphView } from '@/components/ast/ASTGraphView';
import { NodeRenderer } from '@/components/preview/NodeRenderer';
import { LAYOUT_TEMPLATES } from '@/constants/templates';
import { buildAST } from '@/parser/astBuilder';
import { parse } from '@/parser/parser';
import { tokenize } from '@/parser/tokenizer';
import { validateParseArtifacts } from '@/parser/validator';
import { buildDiagnostics } from '@/utils/diagnostics';

import {
  architectureNodes,
  decisionCards,
  executionJourney,
  fileEntries,
  handbookRaw,
  handbookSidebarNotes,
  impactChains,
  learningRoadmap,
  overviewHighlights,
  reactConcepts,
  vivaQuestions,
  vivaTrapCards,
} from './data/knowledgeBase.js';
import { parseHandbookMarkdown } from './lib/handbook.js';

const handbookSections = parseHandbookMarkdown(handbookRaw);
const progressStorageKey = 'mcl-study-progress-v1';

function findNodeById(node, targetId) {
  if (!node || typeof node !== 'object' || !targetId) {
    return null;
  }

  if (node.id === targetId) {
    return node;
  }

  const children = Array.isArray(node.children) ? node.children : [];

  for (const child of children) {
    const match = findNodeById(child, targetId);

    if (match) {
      return match;
    }
  }

  return null;
}

function flattenNodeLabels(node, list = []) {
  if (!node || typeof node !== 'object') {
    return list;
  }

  list.push(node.type);

  const children = Array.isArray(node.children) ? node.children : [];

  for (const child of children) {
    flattenNodeLabels(child, list);
  }

  return list;
}

function renderInline(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${part}-${index}`} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function MarkdownBlock({ block }) {
  if (block.type === 'paragraph') {
    return <p className="doc-paragraph">{renderInline(block.text)}</p>;
  }

  if (block.type === 'subheading') {
    const Tag = block.level === 4 ? 'h4' : 'h3';
    return <Tag className="doc-subheading">{block.text}</Tag>;
  }

  if (block.type === 'quote') {
    return <blockquote className="doc-quote">{renderInline(block.text)}</blockquote>;
  }

  if (block.type === 'bullet-list') {
    return (
      <ul className="doc-list">
        {block.items.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'numbered-list') {
    return (
      <ol className="doc-list doc-list-numbered">
        {block.items.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ol>
    );
  }

  if (block.type === 'table') {
    return (
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              {block.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === 'code') {
    return (
      <div className="code-slab">
        <div className="code-slab-header">
          <span>{block.language || 'text'}</span>
        </div>
        <pre className="code-block">
          <code>{block.code}</code>
        </pre>
      </div>
    );
  }

  return null;
}

function OverviewSection({ onJump }) {
  const stats = [
    { label: 'Major files to know', value: fileEntries.length },
    { label: 'Architecture nodes', value: architectureNodes.length },
    { label: 'Viva practice cards', value: vivaQuestions.length },
    { label: 'Learning roadmap stages', value: learningRoadmap.length },
  ];

  return (
    <section className="content-section hero-section" id="overview">
      <div className="hero-glow" />
      <div className="eyebrow">Private viva prep workspace</div>
      <h1>MCL Studio Learning Console</h1>
      <p className="hero-lead">
        Master the architecture, parser flow, React state model, AST behavior,
        and viva answers of MCL Studio through an interactive study website
        built from your engineering handbook and actual source code.
      </p>

      <div className="hero-cta-row">
        <button className="primary-button" onClick={() => onJump('code-journey')} type="button">
          Start With Runtime Flow
        </button>
        <button className="ghost-button" onClick={() => onJump('viva-mode')} type="button">
          Practice Viva Questions
        </button>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <article className="glass-card stat-card" key={stat.label}>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </article>
        ))}
      </div>

      <div className="overview-grid">
        <article className="glass-card">
          <h2>What this project is</h2>
          <p>
            A React-based layout authoring tool that parses a custom markdown-like
            syntax into tokens, builds an AST, validates structure, and renders a
            live layout canvas.
          </p>
        </article>

        <article className="glass-card">
          <h2>Why it exists</h2>
          <p>
            Plain markdown is strong for prose but weak for layout. MCL Studio
            introduces a constrained layout grammar so structure becomes explicit,
            inspectable, and renderable.
          </p>
        </article>

        <article className="glass-card">
          <h2>Why it is interesting</h2>
          <p>
            It combines frontend UX, parser design, AST construction, structural
            validation, runtime synchronization, and developer-facing visibility
            in one coherent React system.
          </p>
        </article>
      </div>

      <div className="feature-panel-grid">
        <article className="glass-card">
          <h3>Project Snapshot</h3>
          <ul className="feature-list">
            {overviewHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="glass-card">
          <h3>Learning Roadmap</h3>
          <ol className="feature-list numbered">
            {learningRoadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}

function ArchitectureExplorer() {
  const [selectedId, setSelectedId] = useState(architectureNodes[0].id);
  const selectedNode =
    architectureNodes.find((node) => node.id === selectedId) ?? architectureNodes[0];

  return (
    <section className="content-section" id="architecture-explorer">
      <div className="section-intro">
        <span className="section-kicker">Interactive architecture explorer</span>
        <h2>Click the system and learn why it exists</h2>
        <p>
          This is not a static diagram. Click any architecture node and read its
          purpose, dependencies, responsibilities, and failure impact.
        </p>
      </div>

      <div className="explorer-grid">
        <div className="node-stack">
          {architectureNodes.map((node) => (
            <button
              className={`node-pill ${node.id === selectedId ? 'node-pill-active' : ''}`}
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              type="button"
            >
              {node.label}
            </button>
          ))}
        </div>

        <article className="glass-card detail-card">
          <div className="detail-header">
            <div>
              <span className="detail-kicker">Focused subsystem</span>
              <h3>{selectedNode.label}</h3>
            </div>
            <span className="detail-tag">{selectedNode.relatedFiles[0]}</span>
          </div>

          <div className="detail-grid">
            <div>
              <h4>Purpose</h4>
              <p>{selectedNode.purpose}</p>
            </div>
            <div>
              <h4>Why it exists</h4>
              <p>{selectedNode.why}</p>
            </div>
            <div>
              <h4>Inputs</h4>
              <ul className="plain-list">
                {selectedNode.inputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Outputs</h4>
              <ul className="plain-list">
                {selectedNode.outputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Responsibilities</h4>
              <ul className="plain-list">
                {selectedNode.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Dependencies</h4>
              <ul className="plain-list">
                {selectedNode.dependencies.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="impact-strip">
            <h4>What breaks if removed</h4>
            <p>{selectedNode.breaks}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function FileExplorer() {
  const [selectedPath, setSelectedPath] = useState(fileEntries[0].path);
  const selectedFile =
    fileEntries.find((entry) => entry.path === selectedPath) ?? fileEntries[0];
  const groupedFiles = fileEntries.reduce((accumulator, entry) => {
    accumulator[entry.group] ??= [];
    accumulator[entry.group].push(entry);
    return accumulator;
  }, {});

  return (
    <section className="content-section" id="file-explorer">
      <div className="section-intro">
        <span className="section-kicker">Interactive file explorer</span>
        <h2>Learn the repository by responsibility</h2>
        <p>
          Open files the same way an external examiner might: one file at a time,
          with purpose, inputs, outputs, dependencies, and a real code snippet.
        </p>
      </div>

      <div className="explorer-grid">
        <aside className="glass-card file-tree">
          {Object.entries(groupedFiles).map(([group, entries]) => (
            <div className="file-group" key={group}>
              <h3>{group}</h3>
              {entries.map((entry) => (
                <button
                  className={`file-item ${entry.path === selectedPath ? 'file-item-active' : ''}`}
                  key={entry.path}
                  onClick={() => setSelectedPath(entry.path)}
                  type="button"
                >
                  {entry.path.split('/').at(-1)}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <article className="glass-card detail-card">
          <div className="detail-header">
            <div>
              <span className="detail-kicker">{selectedFile.group}</span>
              <h3>{selectedFile.path}</h3>
            </div>
            <span className="detail-tag">{selectedFile.oneLine}</span>
          </div>

          <div className="detail-grid">
            <div>
              <h4>Purpose</h4>
              <p>{selectedFile.purpose}</p>
            </div>
            <div>
              <h4>Responsibility</h4>
              <p>{selectedFile.responsibility}</p>
            </div>
            <div>
              <h4>Inputs</h4>
              <ul className="plain-list">
                {selectedFile.inputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Outputs</h4>
              <ul className="plain-list">
                {selectedFile.outputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Dependencies</h4>
              <ul className="plain-list">
                {selectedFile.dependencies.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Impact if removed</h4>
              <p>{selectedFile.impact}</p>
            </div>
          </div>

          <div className="viva-callout">
            <h4>20-second viva explanation</h4>
            <p>{selectedFile.viva}</p>
          </div>

          <div className="code-slab">
            <div className="code-slab-header">
              <span>Important code snippet</span>
            </div>
            <pre className="code-block">
              <code>{selectedFile.snippet}</code>
            </pre>
          </div>
        </article>
      </div>
    </section>
  );
}

function CodeJourneySection() {
  const [activeStepId, setActiveStepId] = useState(executionJourney[0].id);
  const activeStep =
    executionJourney.find((step) => step.id === activeStepId) ?? executionJourney[0];

  return (
    <section className="content-section" id="code-journey">
      <div className="section-intro">
        <span className="section-kicker">Code execution journey</span>
        <h2>What happens when you type a single character?</h2>
        <p>
          This section is designed for viva clarity. Step through the real runtime
          order until the execution flow feels natural.
        </p>
      </div>

      <div className="journey-shell">
        <div className="journey-rail">
          {executionJourney.map((step, index) => (
            <button
              className={`journey-step ${step.id === activeStepId ? 'journey-step-active' : ''}`}
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              type="button"
            >
              <span className="journey-step-index">{index + 1}</span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        <article className="glass-card detail-card">
          <div className="detail-header">
            <div>
              <span className="detail-kicker">Current runtime stage</span>
              <h3>{activeStep.label}</h3>
            </div>
            <span className="detail-tag">{activeStep.file}</span>
          </div>

          <p className="flow-description">{activeStep.description}</p>

          <div className="detail-grid">
            <div>
              <h4>What enters</h4>
              <p>{activeStep.enters}</p>
            </div>
            <div>
              <h4>What happens</h4>
              <p>{activeStep.happens}</p>
            </div>
            <div>
              <h4>What exits</h4>
              <p>{activeStep.exits}</p>
            </div>
            <div>
              <h4>Why it exists</h4>
              <p>{activeStep.why}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function ParserSimulatorSection() {
  const [templateId, setTemplateId] = useState(LAYOUT_TEMPLATES[0].id);
  const [source, setSource] = useState(LAYOUT_TEMPLATES[0].content);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const simulator = useMemo(() => {
    try {
      const tokens = tokenize(source);
      const ast = buildAST(tokens);
      const validation = validateParseArtifacts({ tokens, ast });
      const diagnostics = buildDiagnostics({
        tokens,
        ast,
        errors: validation.errors,
        parseTime: 0,
      });
      const parseResult = parse(source);

      return {
        tokens,
        ast,
        validation,
        diagnostics,
        parseResult,
        error: null,
      };
    } catch (error) {
      return {
        tokens: [],
        ast: null,
        validation: { errors: [], warnings: [] },
        diagnostics: { tokenCount: 0, astDepth: 0, parseTime: 0, errorCount: 0 },
        parseResult: { ast: null, errors: [], warnings: [], diagnostics: {} },
        error: error instanceof Error ? error.message : 'Unknown simulator failure',
      };
    }
  }, [source]);

  const selectedNode = findNodeById(simulator.ast, selectedNodeId);
  const astLabels = simulator.ast ? flattenNodeLabels(simulator.ast) : [];

  function handleTemplateChange(nextTemplateId) {
    setTemplateId(nextTemplateId);
    const nextTemplate = LAYOUT_TEMPLATES.find((template) => template.id === nextTemplateId);

    if (nextTemplate) {
      setSource(nextTemplate.content);
      setSelectedNodeId(null);
    }
  }

  return (
    <section className="content-section" id="parser-simulator">
      <div className="section-intro">
        <span className="section-kicker">Parser pipeline simulator</span>
        <h2>See every transformation live</h2>
        <p>
          This section uses the actual parser modules from MCL Studio. Modify the
          input and watch the token stream, AST, validation, diagnostics, and
          rendered output update together.
        </p>
      </div>

      <div className="simulator-toolbar">
        <select
          className="simulator-select"
          onChange={(event) => handleTemplateChange(event.target.value)}
          value={templateId}
        >
          {LAYOUT_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
        <span className="simulator-status">
          {simulator.error ? 'Parser failure surfaced safely' : 'Live pipeline ready'}
        </span>
      </div>

      <div className="simulator-grid">
        <article className="glass-card">
          <h3>Raw Input</h3>
          <textarea
            className="simulator-textarea"
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            value={source}
          />
        </article>

        <article className="glass-card">
          <h3>Tokens</h3>
          <pre className="code-block tall-code">
            <code>{JSON.stringify(simulator.tokens, null, 2)}</code>
          </pre>
        </article>

        <article className="glass-card">
          <h3>AST Graph</h3>
          {simulator.ast ? (
            <div className="ast-study-shell">
              <ASTGraphView
                ast={simulator.ast}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
              />
            </div>
          ) : (
            <p className="muted-copy">No AST available.</p>
          )}
        </article>

        <article className="glass-card">
          <h3>Node Inspection</h3>
          {selectedNode ? (
            <div className="inspector-list">
              <div>
                <span>Type</span>
                <strong>{selectedNode.type}</strong>
              </div>
              <div>
                <span>Start line</span>
                <strong>{selectedNode.startLine}</strong>
              </div>
              <div>
                <span>End line</span>
                <strong>{selectedNode.endLine}</strong>
              </div>
              <div>
                <span>Width</span>
                <strong>{selectedNode.width ?? 'n/a'}</strong>
              </div>
              <div>
                <span>Content</span>
                <strong>{selectedNode.content ?? 'n/a'}</strong>
              </div>
            </div>
          ) : (
            <p className="muted-copy">
              Click a node in the AST graph to inspect its structure and metadata.
            </p>
          )}
          <div className="inspector-footer">
            <span>Flattened node order</span>
            <p>{astLabels.join(' → ') || 'n/a'}</p>
          </div>
        </article>

        <article className="glass-card">
          <h3>Validation</h3>
          <div className="issue-stack">
            {simulator.validation.errors.length === 0 &&
            simulator.validation.warnings.length === 0 ? (
              <div className="issue-card issue-card-ok">No structural issues detected.</div>
            ) : null}
            {simulator.validation.errors.map((issue, index) => (
              <div className="issue-card issue-card-error" key={`error-${index}`}>
                <strong>{issue.message}</strong>
                <span>
                  {issue.type} at line {issue.line}, column {issue.column}
                </span>
              </div>
            ))}
            {simulator.validation.warnings.map((issue, index) => (
              <div className="issue-card issue-card-warning" key={`warning-${index}`}>
                <strong>{issue.message}</strong>
                <span>
                  {issue.type} at line {issue.line}, column {issue.column}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>Diagnostics</h3>
          <div className="stats-inline-grid">
            <div className="mini-stat">
              <span>Tokens</span>
              <strong>{simulator.diagnostics.tokenCount}</strong>
            </div>
            <div className="mini-stat">
              <span>Depth</span>
              <strong>{simulator.diagnostics.astDepth}</strong>
            </div>
            <div className="mini-stat">
              <span>Errors</span>
              <strong>{simulator.diagnostics.errorCount}</strong>
            </div>
          </div>
          {simulator.error ? (
            <div className="issue-card issue-card-error">{simulator.error}</div>
          ) : (
            <p className="muted-copy">
              Diagnostics summarize state. They do not replace validation.
            </p>
          )}
        </article>

        <article className="glass-card simulator-preview-card">
          <h3>Rendered Output</h3>
          <div className="study-preview-shell">
            {simulator.parseResult.ast ? (
              <NodeRenderer
                node={simulator.parseResult.ast}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
                showLayoutBoundaries
              />
            ) : (
              <p className="muted-copy">Nothing renderable yet.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function ReactConceptSection() {
  const [selectedConceptId, setSelectedConceptId] = useState(reactConcepts[0].id);
  const selectedConcept =
    reactConcepts.find((concept) => concept.id === selectedConceptId) ?? reactConcepts[0];

  return (
    <section className="content-section" id="react-concepts">
      <div className="section-intro">
        <span className="section-kicker">React through this project</span>
        <h2>Learn React using MCL Studio instead of textbook examples</h2>
        <p>
          Every concept here is tied to a real file, a real snippet, and a real viva question.
        </p>
      </div>

      <div className="explorer-grid">
        <div className="node-stack">
          {reactConcepts.map((concept) => (
            <button
              className={`node-pill ${concept.id === selectedConceptId ? 'node-pill-active' : ''}`}
              key={concept.id}
              onClick={() => setSelectedConceptId(concept.id)}
              type="button"
            >
              {concept.title}
            </button>
          ))}
        </div>

        <article className="glass-card detail-card">
          <div className="detail-header">
            <div>
              <span className="detail-kicker">React concept</span>
              <h3>{selectedConcept.title}</h3>
            </div>
            <span className="detail-tag">{selectedConcept.file}</span>
          </div>

          <div className="detail-grid">
            <div>
              <h4>Definition</h4>
              <p>{selectedConcept.definition}</p>
            </div>
            <div>
              <h4>Where used</h4>
              <p>{selectedConcept.whereUsed}</p>
            </div>
            <div>
              <h4>Why it was needed</h4>
              <p>{selectedConcept.whyNeeded}</p>
            </div>
            <div>
              <h4>Likely viva question</h4>
              <p>{selectedConcept.vivaQuestion}</p>
            </div>
          </div>

          <div className="viva-callout">
            <h4>Strong answer</h4>
            <p>{selectedConcept.answer}</p>
          </div>

          <div className="code-slab">
            <div className="code-slab-header">
              <span>Actual project snippet</span>
            </div>
            <pre className="code-block">
              <code>{selectedConcept.snippet}</code>
            </pre>
          </div>
        </article>
      </div>
    </section>
  );
}

function VivaModeSection() {
  const [difficulty, setDifficulty] = useState('all');
  const [revealed, setRevealed] = useState({});
  const filteredQuestions =
    difficulty === 'all'
      ? vivaQuestions
      : vivaQuestions.filter((question) => question.difficulty === difficulty);

  function toggleReveal(id) {
    setRevealed((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <section className="content-section" id="viva-mode">
      <div className="section-intro">
        <span className="section-kicker">Viva preparation mode</span>
        <h2>Practice before the panel asks</h2>
        <p>
          Start with the question, think first, then reveal the answer. Train
          recall, not just recognition.
        </p>
      </div>

      <div className="filter-row">
        {['all', 'easy', 'medium', 'hard', 'brutal'].map((level) => (
          <button
            className={`filter-pill ${difficulty === level ? 'filter-pill-active' : ''}`}
            key={level}
            onClick={() => setDifficulty(level)}
            type="button"
          >
            {level}
          </button>
        ))}
      </div>

      <div className="qa-grid">
        {filteredQuestions.map((item) => (
          <article className="glass-card qa-card" key={item.id}>
            <div className="qa-header">
              <span className={`difficulty difficulty-${item.difficulty}`}>{item.difficulty}</span>
            </div>
            <h3>{item.question}</h3>
            <p className="qa-think">{item.think}</p>
            <button className="ghost-button" onClick={() => toggleReveal(item.id)} type="button">
              {revealed[item.id] ? 'Hide Answer' : 'Reveal Answer'}
            </button>
            {revealed[item.id] ? <p className="qa-answer">{item.answer}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function TrapsSection() {
  return (
    <section className="content-section" id="common-traps">
      <div className="section-intro">
        <span className="section-kicker">Common viva traps</span>
        <h2>Memorize the correct explanation, not the dangerous shortcut</h2>
      </div>

      <div className="trap-grid">
        {vivaTrapCards.map((card, index) => (
          <article className="glass-card trap-card" key={`trap-${index}`}>
            <div className="trap-column trap-column-wrong">
              <span className="trap-label">Wrong</span>
              <p>{card.wrong}</p>
            </div>
            <div className="trap-column trap-column-right">
              <span className="trap-label">Correct</span>
              <p>{card.correct}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ImpactSection() {
  const [selectedImpactId, setSelectedImpactId] = useState(impactChains[0].id);
  const selectedImpact =
    impactChains.find((chain) => chain.id === selectedImpactId) ?? impactChains[0];

  return (
    <section className="content-section" id="impact-map">
      <div className="section-intro">
        <span className="section-kicker">What breaks if this breaks?</span>
        <h2>Understand failure impact like an engineer</h2>
      </div>

      <div className="explorer-grid">
        <div className="node-stack">
          {impactChains.map((chain) => (
            <button
              className={`node-pill ${chain.id === selectedImpactId ? 'node-pill-active' : ''}`}
              key={chain.id}
              onClick={() => setSelectedImpactId(chain.id)}
              type="button"
            >
              {chain.title}
            </button>
          ))}
        </div>

        <article className="glass-card detail-card">
          <div className="detail-header">
            <div>
              <span className="detail-kicker">Failure impact chain</span>
              <h3>{selectedImpact.title}</h3>
            </div>
          </div>

          <div className="impact-flow">
            {selectedImpact.chain.map((step, index) => (
              <div className="impact-step" key={`${selectedImpact.id}-${step}`}>
                <span>{step}</span>
                {index < selectedImpact.chain.length - 1 ? (
                  <span className="impact-arrow">↓</span>
                ) : null}
              </div>
            ))}
          </div>

          <p className="impact-summary">{selectedImpact.summary}</p>
        </article>
      </div>
    </section>
  );
}

function DecisionsSection() {
  return (
    <section className="content-section" id="architecture-decisions">
      <div className="section-intro">
        <span className="section-kicker">Architecture decisions</span>
        <h2>Understand not just what was chosen, but what was rejected</h2>
      </div>

      <div className="decision-grid">
        {decisionCards.map((card) => (
          <article className="glass-card decision-card" key={card.id}>
            <h3>{card.decision}</h3>
            <div>
              <h4>Alternatives</h4>
              <ul className="plain-list">
                {card.alternatives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Why rejected</h4>
              <p>{card.rejected}</p>
            </div>
            <div>
              <h4>Tradeoffs</h4>
              <p>{card.tradeoffs}</p>
            </div>
            <div>
              <h4>Final choice</h4>
              <p>{card.finalChoice}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HandbookReference({ sections }) {
  return (
    <section className="content-section" id="handbook-reference">
      <div className="section-intro">
        <span className="section-kicker">Full handbook reference</span>
        <h2>The original deep guide, transformed into a study interface</h2>
        <p>
          Everything below is sourced from your handbook. Use it when you need full context,
          not just quick recall.
        </p>
      </div>

      <div className="handbook-stack">
        {sections.map((sectionData) => (
          <article className="glass-card handbook-card" id={sectionData.id} key={sectionData.id}>
            <h3>{sectionData.title}</h3>
            <div className="markdown-rendered">
              {sectionData.blocks.map((block, index) => (
                <MarkdownBlock block={block} key={`${sectionData.id}-${index}`} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getSearchItems() {
  const sectionItems = handbookSections.map((sectionData) => ({
    id: sectionData.id,
    label: sectionData.title,
    category: 'Handbook section',
    searchText: sectionData.searchText,
  }));

  const fileItems = fileEntries.map((entry) => ({
    id: 'file-explorer',
    label: entry.path,
    category: 'File',
    searchText: `${entry.path} ${entry.oneLine} ${entry.purpose} ${entry.viva}`,
  }));

  const conceptItems = reactConcepts.map((concept) => ({
    id: 'react-concepts',
    label: concept.title,
    category: 'React concept',
    searchText: `${concept.title} ${concept.whereUsed} ${concept.vivaQuestion} ${concept.answer}`,
  }));

  const questionItems = vivaQuestions.map((question) => ({
    id: 'viva-mode',
    label: question.question,
    category: 'Viva question',
    searchText: `${question.question} ${question.answer} ${question.think}`,
  }));

  return [
    { id: 'overview', label: 'Project Snapshot', category: 'Core section', searchText: 'project snapshot overview what is MCL Studio why it exists' },
    { id: 'architecture-explorer', label: 'Architecture Explorer', category: 'Core section', searchText: 'architecture app shell parser renderer hooks preview explorer' },
    { id: 'file-explorer', label: 'Interactive File Explorer', category: 'Core section', searchText: 'file explorer repository understanding purpose responsibility inputs outputs' },
    { id: 'code-journey', label: 'Code Execution Journey', category: 'Core section', searchText: 'execution flow typing parser runtime app shell debounced' },
    { id: 'parser-simulator', label: 'Parser Simulator', category: 'Core section', searchText: 'parser simulator tokens ast validation diagnostics preview' },
    { id: 'react-concepts', label: 'React Concepts Through This Project', category: 'Core section', searchText: 'react useState useEffect hooks props controlled components conditional rendering' },
    { id: 'viva-mode', label: 'Viva Preparation Mode', category: 'Core section', searchText: 'viva questions practice answers external examiner' },
    { id: 'common-traps', label: 'Common Viva Traps', category: 'Core section', searchText: 'wrong correct explanation traps' },
    { id: 'impact-map', label: 'Impact Analysis', category: 'Core section', searchText: 'what breaks if tokenizer validator AppShell breaks impact' },
    { id: 'architecture-decisions', label: 'Architecture Decisions', category: 'Core section', searchText: 'why AST why React why no Redux why no backend decisions' },
    ...sectionItems,
    ...fileItems,
    ...conceptItems,
    ...questionItems,
  ];
}

const navigationSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'architecture-explorer', label: 'Architecture Explorer' },
  { id: 'file-explorer', label: 'File Explorer' },
  { id: 'code-journey', label: 'Code Journey' },
  { id: 'parser-simulator', label: 'Parser Simulator' },
  { id: 'react-concepts', label: 'React Concepts' },
  { id: 'viva-mode', label: 'Viva Mode' },
  { id: 'common-traps', label: 'Viva Traps' },
  { id: 'impact-map', label: 'Impact Map' },
  { id: 'architecture-decisions', label: 'Decisions' },
  { id: 'handbook-reference', label: 'Handbook Reference' },
];

function RightSidebar({ activeSectionId, onToggleReviewed, reviewedSections }) {
  const handbookNote = handbookSidebarNotes[activeSectionId];
  const isReviewed = reviewedSections.includes(activeSectionId);

  const fallback = {
    summary: 'Use this section to deepen understanding, not just skim information.',
    takeaways: [
      'Try to explain the current section aloud in your own words.',
      'Connect UI behavior to source files.',
      'Focus on why each layer exists.',
    ],
    examinerAngle: 'Ask yourself what an external would challenge first in this section.',
    remember: 'Precise explanation beats overcomplicated explanation.',
  };

  const note = handbookNote ?? fallback;

  return (
    <aside className="right-sidebar">
      <div className="sticky-stack">
        <article className="glass-card aside-card">
          <div className="aside-header">
            <span className="detail-kicker">Quick summary</span>
            <button
              className={`review-pill ${isReviewed ? 'review-pill-done' : ''}`}
              onClick={() => onToggleReviewed(activeSectionId)}
              type="button"
            >
              {isReviewed ? 'Reviewed' : 'Mark reviewed'}
            </button>
          </div>
          <p>{note.summary}</p>
        </article>

        <article className="glass-card aside-card">
          <h3>Key takeaways</h3>
          <ul className="plain-list">
            {note.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="glass-card aside-card">
          <h3>Examiner angle</h3>
          <p>{note.examinerAngle}</p>
        </article>

        <article className="glass-card aside-card">
          <h3>What to remember</h3>
          <p>{note.remember}</p>
        </article>
      </div>
    </aside>
  );
}

function App() {
  const searchItems = useMemo(() => getSearchItems(), []);
  const [search, setSearch] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('overview');
  const [reviewedSections, setReviewedSections] = useState(() => {
    try {
      const storedValue = window.localStorage.getItem(progressStorageKey);
      return storedValue ? JSON.parse(storedValue) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(progressStorageKey, JSON.stringify(reviewedSections));
    } catch {
      // Ignore persistence failures for study progress.
    }
  }, [reviewedSections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSectionId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-15% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    );

    const elements = document.querySelectorAll('[id]');
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  function jumpTo(id) {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSectionId(id);
    }
  }

  function toggleReviewed(id) {
    if (!id) {
      return;
    }

    setReviewedSections((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  const filteredSearchItems = search.trim()
    ? searchItems.filter((item) =>
        item.searchText.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : [];

  const totalTrackable = navigationSections.length + handbookSections.length;
  const progressPercent = Math.round((reviewedSections.length / totalTrackable) * 100);

  return (
    <div className="learning-shell">
      <aside className="left-sidebar">
        <div className="sticky-stack">
          <div className="brand-panel">
            <span className="brand-kicker">Private understanding site</span>
            <h1>MCL Studio</h1>
            <p>Architecture explorer, parser debugger, and viva preparation platform.</p>
          </div>

          <div className="glass-card progress-card">
            <div className="progress-head">
              <span>Revision progress</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <p>
              {reviewedSections.length} of {totalTrackable} tracked sections marked reviewed.
            </p>
          </div>

          <div className="glass-card search-card">
            <input
              className="search-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files, hooks, parser stages, viva questions..."
              value={search}
            />
            {filteredSearchItems.length > 0 ? (
              <div className="search-results">
                {filteredSearchItems.slice(0, 10).map((item) => (
                  <button
                    className="search-result"
                    key={`${item.category}-${item.label}`}
                    onClick={() => jumpTo(item.id)}
                    type="button"
                  >
                    <span>{item.label}</span>
                    <small>{item.category}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <nav className="glass-card nav-card">
            <h2>Main sections</h2>
            <div className="nav-list">
              {navigationSections.map((item) => (
                <button
                  className={`nav-link ${activeSectionId === item.id ? 'nav-link-active' : ''}`}
                  key={item.id}
                  onClick={() => jumpTo(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <h2>Handbook parts</h2>
            <div className="nav-list handbook-nav-list">
              {handbookSections.map((sectionData) => (
                <button
                  className={`nav-link ${activeSectionId === sectionData.id ? 'nav-link-active' : ''}`}
                  key={sectionData.id}
                  onClick={() => jumpTo(sectionData.id)}
                  type="button"
                >
                  {sectionData.title}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      <main className="main-column">
        <OverviewSection onJump={jumpTo} />
        <ArchitectureExplorer />
        <FileExplorer />
        <CodeJourneySection />
        <ParserSimulatorSection />
        <ReactConceptSection />
        <VivaModeSection />
        <TrapsSection />
        <ImpactSection />
        <DecisionsSection />
        <HandbookReference sections={handbookSections} />
      </main>

      <RightSidebar
        activeSectionId={activeSectionId}
        onToggleReviewed={toggleReviewed}
        reviewedSections={reviewedSections}
      />
    </div>
  );
}

export default App;
