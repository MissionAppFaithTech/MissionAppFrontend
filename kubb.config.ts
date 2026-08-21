import { defineConfig } from 'kubb/config';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginAxios } from '@kubb/plugin-axios';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Gera a camada de integração back<->front a partir do contrato OpenAPI do
 * MissionApp_Backend (docs/api/v1/openapi.yaml, ADR-0027). Rodar `pnpm openapi:sync`
 * antes pra atualizar openapi/openapi.yaml com a versão mais recente do backend.
 *
 * `baseURL` usa `${...}` de propósito: o kubb emite isso como template literal no
 * client gerado, então `process.env.API_URL` é lido em runtime (mesma env var que
 * `src/lib/api/config.ts` usa) — não fica congelado no valor de quando `kubb generate`
 * rodou. Só usar o client gerado em código server-side (Route Handlers/BFF), igual o
 * `backendFetch` existente — process.env não existe no bundle do browser.
 */
export default defineConfig({
  name: 'missionapp',
  input: './openapi/openapi.yaml',
  output: {
    path: './src/generated/api',
    clean: true,
    format: 'prettier',
    lint: 'eslint',
    barrel: { type: 'named' },
  },
  plugins: [
    pluginTs({
      output: { path: 'models' },
      group: { type: 'tag', name: ({ group }) => capitalize(group) },
    }),
    pluginZod({
      output: { path: 'schemas' },
      group: { type: 'tag', name: ({ group }) => capitalize(group) },
      inferred: true,
      coercion: { numbers: true },
    }),
    pluginAxios({
      output: { path: 'clients' },
      group: { type: 'tag', name: ({ group }) => `${group}Service` },
      baseURL: '${process.env.API_URL ?? "http://localhost:3333"}/api/v1',
      validator: 'zod',
    }),
  ],
});
