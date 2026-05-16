"use client";

interface AssistantWidgetProps {
  onPromptClick?: (prompt: string) => void;
}

export default function AssistantWidget({ onPromptClick }: AssistantWidgetProps) {
  const suggestedPrompts = [
    "Explain the top candidate",
    "Summarize docking results",
    "Identify ADMET risks",
    "Recommend next experiment",
  ];

  return (
    <div className="ui-card-surface flex flex-col gap-5 p-6 border-accent/20 bg-accent/[0.02]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-text">Pharma LLM Assistant</h3>
          <p className="text-[11px] font-medium text-muted-text/70">AI Molecular Intelligence</p>
        </div>
      </div>

      <div className="rounded-lg border border-accent/10 bg-surface-subtle/40 p-3">
        <p className="text-xs leading-relaxed text-text/80">
          Hello! I can help you analyze the <span className="font-bold text-accent">EGFR NSCLC Discovery Program</span> results. What would you like to investigate today?
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-text/50">Suggested Analysis</span>
        <div className="grid gap-2">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onPromptClick?.(prompt)}
              className="flex items-center justify-between rounded-md border border-border/40 bg-card p-2.5 text-left text-[11px] font-semibold text-text/70 transition-all hover:border-accent/40 hover:bg-accent/5 group"
            >
              {prompt}
              <svg className="h-3.5 w-3.5 text-muted-text/30 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button className="flex-1 rounded-md bg-accent px-3 py-2 text-xs font-bold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-accent/30 active:scale-95">
          Open Assistant
        </button>
        <button className="rounded-md border border-border/40 p-2 text-muted-text hover:bg-muted-bg transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
