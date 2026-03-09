# Setup Instructions

## Prerequisites

Before running this project, you need to install Node.js and npm.

### Install Node.js

1. Download Node.js from: https://nodejs.org/
2. Install the LTS (Long Term Support) version
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## Installation

Once Node.js is installed, run:

```bash
npm install
```

This will install all dependencies including:
- TypeScript
- Vitest (testing framework)
- fast-check (property-based testing library)

## Running Tests

After installation, you can run tests with:

```bash
npm test
```

## Project Structure

The project follows a layered architecture:

```
src/
├── presentation/     # UI components (to be implemented)
├── application/      # Business logic orchestration (to be implemented)
├── domain/          # Core types and models
│   ├── types.ts     # Core TypeScript interfaces
│   └── types.test.ts # Basic type tests
└── data-access/     # Storage and validation (to be implemented)
```

## Next Steps

Task 1 is complete. The following have been set up:

✅ Directory structure for layered architecture
✅ Core TypeScript interfaces and types
✅ Testing framework configuration (Vitest + fast-check)
✅ TypeScript strict mode configuration
✅ Basic type validation tests

You can now proceed with Task 2 to implement the localization service.
