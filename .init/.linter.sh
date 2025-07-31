#!/bin/bash
cd /home/kavia/workspace/code-generation/javascript-playground-51082-51091/js_playground_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

