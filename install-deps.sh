#!/bin/bash

# Install dependencies
npm install

# Ensure all Radix UI dependencies are installed
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-slot

# Install UI utilities
npm install class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate

# Install development dependencies
npm install -D @tailwindcss/forms prettier prettier-plugin-tailwindcss

# Install TypeScript types
npm install -D @types/react @types/react-dom @types/node

# Make script executable
chmod +x $(dirname "$0")/install-deps.sh

echo "Dependencies installed successfully!"
