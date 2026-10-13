import type { NextConfig } from 'next';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isProjectPages = process.env.GITHUB_ACTIONS === 'true' && !repositoryName.endsWith('.github.io');
const basePath = isProjectPages && repositoryName ? `/${repositoryName}` : '';

const config: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default config;
