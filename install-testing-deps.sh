#!/bin/bash

# Install testing dependencies
npm install -D \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/testing-library__react \
  @types/testing-library__jest-dom \
  jest \
  jest-environment-jsdom \
  ts-jest \
  @types/jest

# Install runtime testing dependencies
npm install @testing-library/react @testing-library/dom

# Ensure package.json has test script
if ! grep -q "\"test\":" package.json; then
  sed -i '/"scripts": {/a \    "test": "jest",' package.json
fi

echo "Testing dependencies installed successfully!"
