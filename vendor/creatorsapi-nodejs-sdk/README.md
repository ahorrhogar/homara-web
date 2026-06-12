# @amzn/creatorsapi-nodejs-sdk (vendored)

This is the **official** Amazon Creators API Node.js SDK (Apache-2.0), vendored
into the repo because Amazon distributes it as a downloadable ZIP rather than on
the npm registry.

- Source: https://afiliados.amazon.es/creatorsapi/docs/en-us/get-started/using-sdk
- Version: 1.2.0 (adds v3 credential support)
- Only the prebuilt `dist/` is committed; the original `src/` Babel sources and
  build toolchain are omitted. Runtime dependency: `superagent`.

Consumed by `src/infrastructure/amazon/*`, which wraps it with a TPS throttle,
429/5xx retry/backoff, partner-tag/marketplace defaults and a typed surface.

To upgrade: download the new ZIP, run `npm install && npm run build` inside it,
copy the resulting `dist/` here, and bump the version in this `package.json`.
