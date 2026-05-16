"use client";

import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  breadcrumb, 
  description, 
  actions,
  className = "" 
}: PageHeaderProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          {breadcrumb && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-text/50">
              {breadcrumb}
            </div>
          )}
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-text/80">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      <div className="h-px w-full bg-gradient-to-r from-border/60 via-border/20 to-transparent" />
    </div>
  );
}
