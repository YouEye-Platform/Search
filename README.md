# YouEye Search

Private search app for the [YouEye](https://github.com/YouEye-Platform/YouEye) platform.

Search runs as a native YouEye app. It connects to a compatible search backend through YouEye, gives users a focused search interface, and exposes dashboard and timeline surfaces to the platform.

Current public release line: `v0.5.0`

## Features

- Web, image, news, and video search surfaces
- Configurable backend connection through YouEye
- Deep-link handling for search result actions
- Dashboard quick-search widget
- Timeline cards for search activity when enabled
- App-owned settings panel for YouEye Settings
- Theme, language, and account menu integration
- PWA-ready build with service worker assets

## YouEye Surfaces

| Surface | Purpose |
|---|---|
| `/` | Main Search app |
| `/embed/widget/quick-search` | Dashboard search widget |
| `/embed/timeline/search` | Timeline card surface |
| `/embed/settings` | App settings panel shown inside YouEye Settings |
| `/api/manifest` | Native app manifest consumed by Market and UI |
| `/api/health` | Container health and version endpoint |

## Development

```bash
pnpm install
pnpm dev
```

The app uses Next.js 15, TypeScript, Tailwind CSS, and YouEye's native app launch and connection contracts.

## Release Artifact

The Control Panel updater expects each native app release to upload an uncompressed `standalone.tar` asset.

```bash
pnpm build
cd .next/standalone
tar -cf standalone.tar .
```

The release tag for this standalone repo is `v0.5.0` with no component prefix.

## License

YouEye source code is licensed under the [Business Source License 1.1](LICENSE). Each version converts to AGPL-3.0 after four years.

The "YouEye" name and logo are trademarks. See [TRADEMARK.md](TRADEMARK.md) for usage guidelines.
