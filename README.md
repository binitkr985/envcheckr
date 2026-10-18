# envcheckr

A simple, zero-dependency environment variable validator for Node.js.

`envcheckr` checks environment variables against a schema, converts
supported values to their expected JavaScript types, and reports
configuration errors together so you can catch problems before your
application starts.

## Features

- Zero runtime dependencies
- Supports `string`, `number`, and `boolean`
- Optional variables by default
- Mark individual variables as required
- Converts validated numbers and booleans to JavaScript values
- Reports multiple validation errors in one message
- Validates `process.env` by default or a custom environment object
- Uses ES modules

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

`envcheckr` validates environment values; it does not load `.env` files
itself. Load your environment variables before calling `validateEnv()`.

### Using Node.js

Node.js supports the `--env-file` option:

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

You can also use the `dotenv` package:

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

Each schema entry is an object with a `type` and an optional `required`
property.

```js
{
  VARIABLE_NAME: {
    type: "string" | "number" | "boolean",
    required: true | false
  }
}
```

### `type`

The `type` property is required.

---

Type Accepted input Returned value

---

`string` Any non-empty string String

`number` A finite decimal Number
number, including  
 negative and decimal  
 values

`boolean` `true` or `false`, Boolean
case-insensitive

---

Numeric strings are converted to numbers. Boolean strings such as
`"true"` and `"false"` are converted to booleans. Other boolean values
produce a validation error.

### `required`

`required` defaults to `false`.

- `required: true`: the variable must be present and non-empty.
- `required: false` or omitted: the variable may be absent or empty.
  If absent, it is omitted from the returned object.

Examples:

```js
const env = validateEnv({
  PORT: { type: "number", required: true },
  LOG_LEVEL: { type: "string" },
  DEBUG: { type: "boolean", required: false },
});
```

## Using a custom environment object

Pass a second argument to validate an object other than `process.env`.
This is useful for tests and custom configuration.

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

console.log(env.PORT); // 3000
console.log(env.DEBUG); // true
```

The second argument is an environment object, not a path to a `.env`
file.

## Error handling

If required variables are missing or values fail validation,
`validateEnv()` throws an error listing the detected problems.

For example, if `PORT` is required but missing:

```text
Error: Invalid environment:
- PORT is required
```

You can catch the error if you need to handle startup failures yourself:

```js
import { validateEnv } from "envcheckr";

try {
  const env = validateEnv({
    PORT: { type: "number", required: true },
    DEBUG: { type: "boolean" },
  });

  // Start your application using the validated values.
  console.log("Environment validated", env);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
```

Avoid printing secret values in logs. `envcheckr` reports variable names
and validation problems, not the values of those variables.

## Important notes

- Environment variables are strings by default. `envcheckr` converts
  supported `number` and `boolean` values in the returned object.
- Use the returned object (`env`) in your application when you need
  converted values.
- `envcheckr` does not load `.env` files, manage secrets, or change
  `process.env`.
- Missing optional variables are omitted from the returned object;
  they are not assigned a default value.
- Keep real `.env` files and secrets out of source control.

## License

MIT
