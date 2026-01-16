#!/bin/bash

# Activar git hooks personalizados
git config core.hooksPath .githooks

echo "✓ Git hooks activados"
echo "  Los commits ahora serán validados automáticamente"
