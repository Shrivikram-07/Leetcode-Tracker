const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('c:/Users/User/OneDrive/Desktop/Leetcode-Tracker/frontend/src');

// Map of file path to list of imported file paths
const graph = {};

function resolveImport(importPath, dir) {
  const extensions = ['.js', '.jsx', '.css', '.png', '.jpg'];
  let resolved = null;

  // Try direct path, relative or absolute
  let testPath = path.resolve(dir, importPath);
  if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
    return testPath;
  }

  // Try extensions
  for (const ext of extensions) {
    if (fs.existsSync(testPath + ext)) {
      return testPath + ext;
    }
  }

  // Try index files inside folders
  if (fs.existsSync(testPath) && fs.statSync(testPath).isDirectory()) {
    for (const ext of extensions) {
      const indexPath = path.join(testPath, 'index' + ext);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  }

  return null;
}

function parseFile(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return;
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const dir = path.dirname(filePath);
  const imports = [];

  // Match import statements: import ... from "..." or import "..."
  const regexes = [
    /import\s+[\s\S]*?from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g
  ];

  for (const regex of regexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const imp = match[1];
      if (imp.startsWith('.')) { // only local imports
        const resolved = resolveImport(imp, dir);
        if (resolved && (resolved.endsWith('.js') || resolved.endsWith('.jsx'))) {
          imports.push(resolved);
        }
      }
    }
  }

  graph[filePath] = imports;
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules') {
        scanDir(fullPath);
      }
    } else {
      parseFile(fullPath);
    }
  }
}

scanDir(srcDir);

// Detect circular dependencies using DFS
const visited = {};
const recStack = {};
const cycles = [];

function findCycles(node, pathStack = []) {
  visited[node] = true;
  recStack[node] = true;
  pathStack.push(node);

  const neighbors = graph[node] || [];
  for (const neighbor of neighbors) {
    if (!visited[neighbor]) {
      findCycles(neighbor, pathStack);
    } else if (recStack[neighbor]) {
      const cycleIndex = pathStack.indexOf(neighbor);
      if (cycleIndex !== -1) {
        cycles.push(pathStack.slice(cycleIndex).concat(neighbor));
      }
    }
  }

  recStack[node] = false;
  pathStack.pop();
}

for (const node of Object.keys(graph)) {
  if (!visited[node]) {
    findCycles(node);
  }
}

if (cycles.length > 0) {
  console.log(`Found ${cycles.length} circular dependencies:`);
  cycles.forEach((cycle, idx) => {
    console.log(`\nCycle ${idx + 1}:`);
    console.log(cycle.map(f => path.relative(srcDir, f)).join(' -> '));
  });
} else {
  console.log('No circular dependencies found!');
}
