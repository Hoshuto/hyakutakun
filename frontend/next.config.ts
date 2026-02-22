import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",       // Cloudflare Pages 向け静的エクスポート
  trailingSlash: true,    // Cloudflare Pages の SPA ルーティング対応
};

export default nextConfig;
