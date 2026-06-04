"use client";

import React, { useEffect, useState, useRef } from "react";

// Singleton for loading RDKit
let initRDKitPromise: Promise<any> | null = null;
let rdkitModule: any = null;

const loadRDKit = () => {
  if (rdkitModule) return Promise.resolve(rdkitModule);
  if (!initRDKitPromise) {
    initRDKitPromise = new Promise((resolve, reject) => {
      import("@rdkit/rdkit")
        .then((module: any) => {
          let initFn: any = null;
          if (typeof module === "function") {
            initFn = module;
          } else if (module && typeof module.default === "function") {
            initFn = module.default;
          } else if (typeof window !== "undefined" && typeof (window as any).initRDKitModule === "function") {
            initFn = (window as any).initRDKitModule;
          }

          if (!initFn) {
            reject(new Error("Could not find RDKit initialization function"));
            return;
          }

          initFn()
            .then((m: any) => {
              rdkitModule = m;
              resolve(rdkitModule);
            })
            .catch(reject);
        })
        .catch((err) => {
          // If direct import fails, try window.initRDKitModule as a last resort
          if (typeof window !== "undefined" && typeof (window as any).initRDKitModule === "function") {
            (window as any).initRDKitModule()
              .then((m: any) => {
                rdkitModule = m;
                resolve(rdkitModule);
              })
              .catch(reject);
          } else {
            reject(err);
          }
        });
    });
  }
  return initRDKitPromise;
};

interface MoleculeStructureProps {
  smiles: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function MoleculeStructure({
  smiles,
  width = 150,
  height = 100,
  className = "",
}: MoleculeStructureProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [rdkitFailed, setRdkitFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    
    // Reset states on smiles/dimensions change
    setSvg(null);
    setError(false);
    setRdkitFailed(false);
    
    // Simple Intersection Observer to only render when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadRDKit()
            .then((RDKit) => {
              if (!mounted) return;
              try {
                const mol = RDKit.get_mol(smiles);
                if (mol) {
                  const svg = mol.get_svg(width, height);
                  setSvg(svg);
                  mol.delete();
                } else {
                  setError(true);
                }
              } catch (err) {
                console.error("Failed to render SMILES:", smiles, err);
                setError(true);
              }
            })
            .catch((err) => {
              console.error("Failed to load RDKit:", err);
              if (mounted) setRdkitFailed(true);
            });
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [smiles, width, height]);

  return (
    <div 
      ref={containerRef} 
      className={`flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : rdkitFailed ? (
        <span 
          className="text-[10px] font-mono text-gray-500 opacity-70 truncate max-w-full px-1 text-center" 
          title={smiles}
        >
          {smiles}
        </span>
      ) : error ? (
        <span className="text-[10px] font-mono text-error">Invalid SMILES</span>
      ) : (
        <div className="skeleton-shimmer h-full w-full rounded-md opacity-20" />
      )}
    </div>
  );
}

