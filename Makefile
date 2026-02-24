.DEFAULT_GOAL := help

# ==============================================================================
# 設定
# ==============================================================================

VPS_HOST := hyakutakun-vps        # ~/.ssh/config の Host 名
VPS_DIR  := ~/hyakutakun/backend  # VPS上のバックエンドディレクトリ

# ==============================================================================
# Help
# ==============================================================================

.PHONY: help
help: ## コマンド一覧を表示
	@echo ""
	@echo "使い方: make [target]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ==============================================================================
# ローカル開発
# ==============================================================================

.PHONY: local
local: ## フロントエンド + バックエンドを同時起動（Ctrl+C で両方停止）
	@echo ""
	@echo "  ローカル開発環境を起動中..."
	@echo "  フロントエンド → http://localhost:9002"
	@echo "  バックエンド   → http://localhost:9001"
	@echo "  停止: Ctrl+C"
	@echo ""
	@trap 'kill 0' INT; \
	(cd backend && .venv/bin/uvicorn main:app --reload --port 9001 2>&1 | sed 's/^/[backend] /') & \
	(cd frontend && npm run dev -- -p 9002 2>&1 | sed 's/^/[frontend] /') & \
	wait

.PHONY: frontend
frontend: ## フロントエンド 開発サーバーのみ起動 (port 9002)
	@echo "フロントエンド起動中... → http://localhost:9002"
	cd frontend && npm run dev -- -p 9002

.PHONY: backend
backend: ## バックエンド 開発サーバーのみ起動 (port 9001)
	@echo "バックエンド起動中... → http://localhost:9001"
	cd backend && .venv/bin/uvicorn main:app --reload --port 9001

# ==============================================================================
# ビルド
# ==============================================================================

.PHONY: build
build: ## フロントエンドをビルド（out/ に静的ファイルを生成）
	@echo "フロントエンドをビルド中..."
	cd frontend && npm run build
	@echo "ビルド完了: frontend/out/"

# ==============================================================================
# デプロイ
# ==============================================================================

.PHONY: deploy-frontend
deploy-frontend: build ## フロントエンドをビルドして Cloudflare Pages にデプロイ
	@echo "Cloudflare Pages にデプロイ中..."
	cd frontend && npm run deploy
	@echo "デプロイ完了！"

.PHONY: deploy-backend
deploy-backend: ## バックエンドを ConoHa VPS にデプロイ（SSH経由）
	@echo "バックエンドを $(VPS_HOST) にデプロイ中..."
	ssh $(VPS_HOST) "cd $(VPS_DIR) && git pull origin main && docker compose up --build -d"
	@echo "デプロイ完了！"

.PHONY: deploy
deploy: deploy-frontend deploy-backend ## フロントエンド + バックエンドを両方デプロイ

# ==============================================================================
# ログ・状態確認
# ==============================================================================

.PHONY: logs
logs: ## VPS のバックエンドログを表示
	ssh $(VPS_HOST) "cd $(VPS_DIR) && docker compose logs -f api"

.PHONY: status
status: ## VPS のコンテナ状態を確認
	ssh $(VPS_HOST) "cd $(VPS_DIR) && docker compose ps"

# ==============================================================================
# Cloudflare / wrangler
# ==============================================================================

.PHONY: wrangler-login
wrangler-login: ## Cloudflare にログイン（初回のみ）
	cd frontend && npx wrangler login
