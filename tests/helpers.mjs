// Loads the extension's classic-script source files into a sandboxed VM
// context so the pure-logic functions can be exercised from Vitest without
// needing the browser globals or restructuring the extension to use ES
// modules. Top-level `function` and `class` declarations in script mode
// become own properties of the sandbox object, so the returned context is
// effectively the file's exported surface.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function makeBrowserStub(overrides = {}) {
  const noop = () => {};
  const asyncNoop = async () => undefined;
  return {
    storage: {
      local: { get: async () => ({}), set: asyncNoop },
      sync: { get: async () => ({}), set: asyncNoop }
    },
    alarms: {
      get: async () => null,
      create: noop,
      onAlarm: { addListener: noop }
    },
    runtime: {
      getURL: p => 'chrome-extension://test/' + p,
      onMessage: { addListener: noop },
      sendMessage: asyncNoop,
      openOptionsPage: noop
    },
    history: { search: async () => [], getVisits: async () => [] },
    action: { setBadgeText: asyncNoop, setBadgeBackgroundColor: asyncNoop },
    tabs: {
      TAB_ID_NONE: -1,
      query: async () => [],
      onCreated: { addListener: noop },
      onUpdated: { addListener: noop },
      onRemoved: { addListener: noop }
    },
    ...overrides
  };
}

export function loadScript(relativePath, extraContext = {}, exposeNames = []) {
  let src = readFileSync(resolve(root, relativePath), 'utf8');
  // Top-level `function` declarations bind to the global object in script
  // mode, but `class` and `let`/`const` do not. Append an explicit hoist
  // for any names the caller wants to read back from the sandbox.
  if (exposeNames.length > 0) {
    const hoist = exposeNames
      .map(n => `try { globalThis.${n} = ${n}; } catch (e) {}`)
      .join('\n');
    src = src + '\n' + hoist + '\n';
  }
  const context = {
    browser: makeBrowserStub(),
    fetch: async () => ({ ok: false, text: async () => '' }),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    console,
    crypto: globalThis.crypto,
    ...extraContext
  };
  runInNewContext(src, context, { filename: relativePath });
  return context;
}
