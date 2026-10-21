const VALID_TYPES = new Set(["string", "number", "boolean"]);
const CURRENT_VERSION = "1.0.4";
let hasCheckedUpdate = false;

function isNewer(latest, current) {
  const clean = (v) => v.split("-")[0].split(".").map(Number);
  const [lMaj = 0, lMin = 0, lPat = 0] = clean(latest);
  const [cMaj = 0, cMin = 0, cPat = 0] = clean(current);
  if (lMaj > cMaj) return true;
  if (lMaj < cMaj) return false;
  if (lMin > cMin) return true;
  if (lMin < cMin) return false;
  if (lPat > cPat) return true;
  if (lPat < cPat) return false;
  return !latest.includes("-") && current.includes("-");
}

function checkForUpdates() {
  if (hasCheckedUpdate || typeof fetch !== "function") return;
  if (
    process.env?.ENVCHECKR_NO_UPDATE_CHECK ||
    process.env?.NODE_ENV === "test"
  )
    return;
  hasCheckedUpdate = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    timeout.unref?.();

    fetch("https://registry.npmjs.org/envcheckr/latest", {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        clearTimeout(timeout);
        if (data?.version && isNewer(data.version, CURRENT_VERSION)) {
          console.warn(
            `\x1b[33m[envcheckr]\x1b[0m A new version (${data.version}) is available. Current: ${CURRENT_VERSION}. Run 'npm update envcheckr' to update.`,
          );
        }
      })
      .catch(() => {});
  } catch {}
}

/**
 * Validate environment variables against a schema.
 *
 * @param {Record<string, { type: "string" | "number" | "boolean", required?: boolean }>} schema
 * @param {Record<string, string | number | boolean | null | undefined>} [env=process.env]
 * @param {{ checkUpdates?: boolean }} [options={}]
 * @returns {Record<string, string | number | boolean>}
 */
export function validateEnv(schema, env = process.env, options = {}) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    throw new TypeError("validateEnv() expects a schema object");
  }

  if (!env || typeof env !== "object" || Array.isArray(env)) {
    throw new TypeError("validateEnv() expects an environment object");
  }

  if (
    options !== undefined &&
    (typeof options !== "object" || options === null || Array.isArray(options))
  ) {
    throw new TypeError("validateEnv() expects an options object");
  }

  const { checkUpdates = true } = options || {};
  if (checkUpdates) {
    checkForUpdates();
  }

  const entries = [];
  const errors = [];

  for (const [name, rule] of Object.entries(schema)) {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
      errors.push(`${name} must have a valid schema rule`);
      continue;
    }

    const { type, required = false } = rule;

    if (!VALID_TYPES.has(type)) {
      const typeLabel = typeof type === "string" ? type : typeof type;
      errors.push(`${name} has an unsupported type: ${typeLabel}`);
      continue;
    }

    if (typeof required !== "boolean") {
      errors.push(`${name}.required must be a boolean`);
      continue;
    }

    const hasProperty = Object.prototype.hasOwnProperty.call(env, name);
    const rawValue = hasProperty ? env[name] : undefined;

    if (rawValue === undefined || rawValue === null) {
      if (required) {
        errors.push(`${name} is required`);
      }
      continue;
    }

    const value = typeof rawValue === "string" ? rawValue : String(rawValue);

    if (value.trim() === "") {
      if (required) {
        errors.push(`${name} is required`);
      }
      continue;
    }

    if (type === "string") {
      entries.push([name, value]);
      continue;
    }

    if (type === "number") {
      const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

      if (!numberPattern.test(value.trim())) {
        errors.push(`${name} must be a number`);
        continue;
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        errors.push(`${name} must be a finite number`);
        continue;
      }

      entries.push([name, number]);
      continue;
    }

    if (type === "boolean") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "true") {
        entries.push([name, true]);
      } else if (normalized === "false") {
        entries.push([name, false]);
      } else {
        errors.push(`${name} must be "true" or "false"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment:\n- ${errors.join("\n- ")}`);
  }

  return Object.fromEntries(entries);
}
