# SecurityShrimp Anti-Phishing Extension

A web extension that augments websites with additional visual information so the user can make an informed decision about a site's legitimacy. The extension considers the origin of the link, the sensitivity of the information about to be entered, and look-alike / Unicode domain heuristics to surface phishing risk in-context.

This project is a fork of the original [ZecOps Anti-Phishing Extension](https://github.com/ZecOps/anti-phishing-extension), released under GPLv3 and unmaintained since 2022. SecurityShrimp continues the work: Manifest V3 migration, dependency refresh, and ongoing maintenance.

## Installing the extension

The working-tree `manifest.json` is Chrome-flavored (MV3 service worker only).

* **Chrome / Edge / Chromium:** open `chrome://extensions/`, enable Developer mode, and load the cloned repo folder directly. The vendored `libraries/` directory is checked in, so no build step is required.
* **Firefox:** run `npm install && npm run build` first, then in `about:debugging#/runtime/this-firefox` choose "Load Temporary Add-on" and point it at `dist/firefox/manifest.json`. The Firefox bundle uses `background.scripts` instead of `service_worker` because Firefox's service-worker background support is still pref-gated on most shipped versions.

Published store listings will be linked here once available.

## Browser compatibility

Manifest V3. Targets Chrome / Edge / Chromium and Firefox 140+ (Firefox for Android 142+). Firefox needs the rewritten manifest produced by `npm run build`.

On Firefox MV3, host permissions are optional at install time. Until the user grants access to `downloads.majestic.com`, the top-domains list will be empty and the look-alike / popularity checks will be skipped.

## Development

Requires Node.js 20+.

```sh
npm install         # install build/lint deps
npm run vendor      # refresh libraries/ from node_modules
npm run snapshot    # refresh data/top-domains.txt from Majestic (network)
npm run lint        # eslint over source
npm run lint:fix    # autofix what eslint can
npm run lint:webext # AMO linter against dist/firefox (requires `npm run build` first)
npm run test        # vitest run
npm run test:watch  # vitest watch mode
npm run format      # prettier
npm run build       # vendor + emit dist/chrome/, dist/firefox/, and per-browser zips
```

Third-party library versions are tracked in `package.json`. To bump one, update the version there, run `npm install`, then `npm run vendor` to refresh the files in `libraries/`.

The bundled `data/top-domains.txt` snapshot is committed so first-install works without any host-permission prompt (Firefox MV3 makes the live Majestic fetch optional). Re-run `npm run snapshot` occasionally to refresh; the extension also pulls a fresh list from Majestic weekly at runtime once the host permission is granted.

## License

GPLv3 — see [LICENSE](LICENSE). Inherited from the original ZecOps project; this fork preserves the same license per GPL §5.
