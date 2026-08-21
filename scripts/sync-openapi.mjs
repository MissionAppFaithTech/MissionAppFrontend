#!/usr/bin/env node
/**
 * Copia o contrato OpenAPI do backend (MissionApp_Backend) pra dentro deste repo,
 * em openapi/openapi.yaml. O kubb gera a partir dessa cópia local — não do backend
 * ao vivo — pra o `pnpm kubb:generate` funcionar sem precisar do backend rodando.
 *
 * Assume os dois repos como pastas irmãs (mesmo setup do autor: ~/Projects/MissionApp_Backend
 * e ~/Projects/MissionAppFrontend). Em outra máquina/CI, aponte BACKEND_OPENAPI_PATH pro
 * arquivo `docs/api/v1/openapi.bundle.yaml` do backend.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const source = process.env.BACKEND_OPENAPI_PATH
  ? resolve(process.env.BACKEND_OPENAPI_PATH)
  : resolve(repoRoot, '../MissionApp_Backend/docs/api/v1/openapi.bundle.yaml');

const destination = resolve(repoRoot, 'openapi/openapi.yaml');

if (!existsSync(source)) {
  console.error(`[sync-openapi] Spec não encontrado em: ${source}`);
  console.error('[sync-openapi] Defina BACKEND_OPENAPI_PATH apontando pro openapi.bundle.yaml do backend.');
  process.exit(1);
}

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);

console.log(`[sync-openapi] ${source} -> ${destination}`);
