# Ralph Agent Configuration

## Development Workflow

### Commands
- `npm start` - Start dev server (port 1989)
- `npm test` - Run all tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run check-types` - TypeScript type checking
- `npm run snapshot` - Update Jest snapshots
- `make i18n.extract` - Extract i18n messages

## Setup Instructions

Ensure correct node version is installed:
`$ nvm use`

Install dependencies:
`$ npm ci`

## Notes
- Port: 1989
- Environment variables are in `.env` files
- Architecture documentation in `CLAUDE.md`
- Target coverage: 80%+
