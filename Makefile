.PHONY: help install dev build start lint lint-fix typecheck format format-check deploy storage-migrate

help:
	@printf "Available commands:\n"
	@printf "  make install          Install dependencies\n"
	@printf "  make dev              Start Next.js dev server\n"
	@printf "  make build            Build app for production\n"
	@printf "  make start            Start production server\n"
	@printf "  make lint             Run ESLint\n"
	@printf "  make lint-fix         Run ESLint with --fix\n"
	@printf "  make typecheck        Run TypeScript checks\n"
	@printf "  make format           Format code with Prettier\n"
	@printf "  make format-check     Check formatting\n"
	@printf "  make storage-migrate  Migrate Vercel Blob URLs to Azure Blob\n"
	@printf "  make deploy           Deploy app + job to Azure Container Apps\n"

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

typecheck:
	pnpm typecheck

format:
	pnpm format

format-check:
	pnpm format:check

storage-migrate:
	pnpm storage:migrate:vercel-to-azure

deploy:
	bash scripts/deploy-azure-containerapps.sh
