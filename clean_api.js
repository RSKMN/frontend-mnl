const fs = require('fs');

let code = fs.readFileSync('src/services/api.ts', 'utf8');

// 1. Remove mockApi import
code = code.replace(/import \* as mockApi from "\.\/mockApi";\n?/g, '');

// 2. Remove DEMO_ARTIFACTS etc imports from pipelineDemo if they exist
code = code.replace(/import \{.*\} from "\.\/pipelineDemo";\n?/g, '');

// 3. Remove isDemoMode function
code = code.replace(/\/\*\*.*?isDemoMode[\s\S]*?export function isDemoMode\(\): boolean \{[\s\S]*?\}\n/g, '');
code = code.replace(/export function isDemoMode\(\): boolean \{[\s\S]*?\n\}\n/g, '');

// 4. Remove all if (isDemoMode()) { ... } blocks
code = code.replace(/^[ \t]*if\s*\(isDemoMode\(\)\)\s*\{[\s\S]*?^\s*\}(?:\s*else\s*\{[\s\S]*?^\s*\})?/gm, '');

// 5. Remove any leftover isDemoMode usages
code = code.replace(/isDemoMode\(\)/g, 'false');

fs.writeFileSync('src/services/api.ts', code);
console.log('Cleaned api.ts');
