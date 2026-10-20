const VALID_TYPES = new Set(["string", "number", "boolean"]);

/**
 * Validate environment variables against a schema.
 *
 * @param {Record<string, { type: "string" | "number" | "boolean", required?: boolean }>} schema
 * @param {Record<string, string | undefined>} env
 * @returns {Record<string, string | number | boolean>}
 */
export function validateEnv(schema, env = process.env) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    throw new TypeError("validateEnv() expects a schema object");
  }

  if (!env || typeof env !== "object" || Array.isArray(env)) {
    throw new TypeError("validateEnv() expects an environment object");
  }

  const values = {};
  const errors = [];

  for (const [name, rule] of Object.entries(schema)) {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
      errors.push(`${name} must have a valid schema rule`);
      continue;
    }

    const { type, required = false } = rule;

    if (!VALID_TYPES.has(type)) {
      errors.push(`${name} has an unsupported type: ${String(type)}`);
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
      values[name] = value;
      continue;
    }

    if (type === "number") {
      const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

      if (!numberPattern.test(value.trim())) {
        errors.push(`${name} must be a number`);
        continue;
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        errors.push(`${name} must be a finite number`);
        continue;
      }

      values[name] = number;
      continue;
    }

    if (type === "boolean") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "true") {
        values[name] = true;
      } else if (normalized === "false") {
        values[name] = false;
      } else {
        errors.push(`${name} must be "true" or "false"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment:\n- ${errors.join("\n- ")}`);
  }

  return values;
}
