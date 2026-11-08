#!/usr/bin/env bash
cd "$(dirname "$0")"
command -v npm >/dev/null || { echo "Node.js nerastas. Įdiek iš https://nodejs.org"; exit 1; }
[ -d node_modules ] || npm install
npm run dev -- --open
