"use client";
import React, { ReactNode } from "react";

interface ErrorStateProps {
  icon?: ReactNode;
  title: string;
  explanation: string;
  debugHint?: string;
  action?: ReactNode;
  className?: string;
}

export default function ErrorState({
  icon,
  title,
  explanation,
  debugHint,
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`ui-card-surface flex flex-col items-center justify-center p-12 text-center border-error/20 bg-error/5 ${className}`}>
      <div className="flex flex-col items-center gap-6 max-w-md">
        {icon ? (
          <div className="text-error">{icon}</div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/15 border border-error/30 text-error">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-lg font-black tracking-tight text-text uppercase">{title}</h3>
          <p className="text-sm font-medium text-muted-text/80 leading-relaxed">
            {explanation}
          </p>
        </div>

        {debugHint && (
          <div className="w-full text-left bg-surface-subtle/50 border border-border/30 rounded-lg p-3.5 font-mono text-[10px] text-muted-text/70 space-y-1">
            <span className="font-black uppercase tracking-wider text-muted-text/50">Debug Telemetry / Signal:</span>
            <p className="break-all">{debugHint}</p>
          </div>
        )}

        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
