# envcheckr

[![npm version](https://img.shields.io/npm/v/envcheckr.svg)](https://www.npmjs.com/package/envcheckr)
[![license](https://img.shields.io/npm/l/envcheckr.svg)](https://github.com/binitkr985/envcheckr/blob/main/LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/envcheckr)

A simple, zero-dependency environment variable validator for Node.js.

`envcheckr` checks environment variables against a schema, converts supported values to their expected JavaScript types, and reports all configuration errors together so you can catch problems before your application starts.

## Features

- **Zero dependencies** & ultra-lightweight
- **Type conversion**: Automatically parses `number` and `boolean` values into native JavaScript types
- **Optional by default**: Variables are optional unless explicitly flagged with `required: true`
- **Batch error reporting**: Collects all missing or invalid variables and reports them together in one comprehensive error
- **Prototype safe**: Checks only own properties (`hasOwnProperty`), guarding against inherited prototype pollution
- **Flexible environment source**: Validates `process.env` by default, or any custom environment/mock object (supporting strings, numbers, booleans, and nullish values)
- **Standard object output**: Returns a clean, standard JavaScript object with only valid and present variables
- **Native ES modules**: Clean, modern ESM exports

## Installation

```bash
npm install envcheckr
```

## Quick start

```js
import { validateEnv } from "envcheckr";

const env = validateEnv({
  PORT: { type: "number", required: true },
  DATABASE_URL: { type: "string", required: true },
  JWT_SECRET: { type: "string", required: true },
  DEBUG: { type: "boolean" },
});

console.log(env.PORT); // 3000 as a number
console.log(env.DEBUG); // true or false, if provided
```

By default, `validateEnv()` reads from `process.env`.

## Loading a `.env` file

`envcheckr` validates environment values; it does not load `.env` files itself. Load your environment variables before calling `validateEnv()`.

### Using Node.js (Built-in)

Node.js (v20.6.0+) supports the `--env-file` option natively:

```bash
node --env-file=.env index.js
```

Example `.env` file:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/mydb
JWT_SECRET=replace-with-a-real-secret
DEBUG=true
```

### Using dotenv

You can also use the popular `dotenv` package:

```bash
npm install dotenv
```

```js
import "dotenv/config";
import { validateEnv } from "envcheckr";

const env = validateEnv({
  PORT: { type: "number", required: true },
  DATABASE_URL: { type: "string", required: true },
  JWT_SECRET: { type: "string", required: true },
  DEBUG: { type: "boolean" },
});
```

## Schema reference

Each schema entry is an object defining a `type` and an optional `required` boolean property:

```js
{
  VARIABLE_NAME: {
    type: "string" | "number" | "boolean",
    required: true | false // default: false
  }
}
```

### Supported Types

| Type      | Accepted Input                                                    | Returned JavaScript Value     |
| :-------- | :---------------------------------------------------------------- | :---------------------------- |
| `string`  | Any non-empty string                                              | `string`                      |
| `number`  | Finite numbers (integers, floats, scientific notation like `1e5`) | `number`                      |
| `boolean` | `"true"` or `"false"` (case-insensitive)                          | `boolean` (`true` or `false`) |

- **Strings**: Empty or whitespace-only strings are treated as unset/missing.
- **Numbers**: Trimmed numeric strings are converted using `Number()`. Non-numeric or non-finite values produce a validation error.
- **Booleans**: Normalized case-insensitively. Any string other than `"true"` or `"false"` produces a validation error.

### `required`

`required` defaults to `false`.

- `required: true`: The variable must be present and non-empty. If missing, `null`, `undefined`, or empty string, an error is recorded.
- `required: false` (or omitted): The variable is optional. If absent, `null`, or empty, it is safely omitted from the returned object.

Example:

```js
const env = validateEnv({
  PORT: { type: "number", required: true },
  LOG_LEVEL: { type: "string" }, // optional
  DEBUG: { type: "boolean", required: false }, // optional
});
```

## Using a custom environment object

Pass an object as the second argument to validate something other than `process.env`. This is especially useful for unit testing and custom configurations:

```js
import { validateEnv } from "envcheckr";

const env = validateEnv(
  {
    PORT: { type: "number", required: true },
    DEBUG: { type: "boolean" },
  },
  {
    PORT: "3000",
    DEBUG: "true",
  },
);

console.log(env.PORT); // 3000 (number)
console.log(env.DEBUG); // true (boolean)
```

In custom environment objects:

- Values can be strings, numbers, or booleans (e.g. `{ PORT: 3000 }` will be safely processed).
- Values of `null` or `undefined` are treated as absent.
- Only own properties are validated—inherited prototype properties are safely ignored.

## Options

`validateEnv()` accepts an optional third argument for configuration:

```js
const env = validateEnv(schema, process.env, {
  checkUpdates: true, // default: true
});
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `checkUpdates` | `boolean` | `true` | Checks npm in the background and prints a non-blocking warning if a newer version is available. |

You can disable update checks by passing `{ checkUpdates: false }`, setting `ENVCHECKR_NO_UPDATE_CHECK=1` in your environment, or running in test environments (`NODE_ENV=test`).

## Error handling

If validation fails, `validateEnv()` throws an `Error` summarizing all detected issues:

```text
Error: Invalid environment:
- PORT is required
- DATABASE_URL is required
- MAX_RETRIES must be a number
```

### Catching Startup Errors

You can catch errors to handle startup failures gracefully:

```js
import { validateEnv } from "envcheckr";

try {
  const env = validateEnv({
    PORT: { type: "number", required: true },
    DATABASE_URL: { type: "string", required: true },
  });

  // Start your application
  startServer(env);
} catch (error) {
  console.error("Configuration error:\n", error.message);
  process.exit(1);
}
```

> **Security Note**: `envcheckr` only reports variable names and validation reasons in error messages, never the actual secret values.

### Argument Validation

`validateEnv()` also performs strict argument checks:

- Throws `TypeError("validateEnv() expects a schema object")` if `schema` is not a valid non-array object.
- Throws `TypeError("validateEnv() expects an environment object")` if `env` is not a valid non-array object.

## Important notes

- **Environment variables are strings by default**: `envcheckr` automatically converts validated `number` and `boolean` variables into native JavaScript types in the returned object.
- **Use the returned object**: Always use the returned `env` object rather than `process.env` to take advantage of type conversion and validation guarantees.
- **Does not mutate**: `envcheckr` never modifies `process.env` or your input object.
- **Does not load files**: `envcheckr` is strictly a validator. Use Node's `--env-file` flag or `dotenv` to load `.env` files into `process.env`.
- **Clean output**: Missing optional variables are omitted from the returned object rather than set to `undefined` or default values.

## Support the Project

If `envcheckr` is useful to you, consider supporting its development. Your support helps with maintenance, improvements, and future releases.

<p>
  <a href="https://buymeacoffee.com/binitkr9852" target="_blank">
    <img
      src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
      alt="Buy Me a Coffee"
      height="50"
    />
  </a>
  &nbsp;&nbsp;
  <a href="https://www.buymeachai.in/binitkr9852" target="_blank">
    <img
      src="https://binitkr.cd.am/image-2.png"
      alt="Buy Me a Chai"
      height="50"
    />
  </a>
</p>

## License

MIT
