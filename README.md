# envcheckr

Simple, zero-dependency environment variable validation for Node.js.

Catch missing environment variables and invalid values before your application starts.

## Installation

```bash
npm install envcheckr
```

## Usage

```js
import { validateEnv } from "envcheckr";

const env = validateEnv({
  PORT: { type: "number", required: true },
  DATABASE_URL: { type: "string", required: true },
  JWT_SECRET: { type: "string", required: true },
  DEBUG: { type: "boolean" },
});

console.log(env.PORT);
```

## Supported Types

| Type      | Accepted values                      | Returned value |
| --------- | ------------------------------------ | -------------- |
| `string`  | Any non-empty string                 | String         |
| `number`  | Finite decimal numbers               | Number         |
| `boolean` | `true` or `false` (case-insensitive) | Boolean        |

## Schema Options

- `type`: Required. Specifies the expected type.
- `required`: Optional. Defaults to `false`.

Missing optional variables are omitted from the returned object.

## Custom Environment

```js
const env = validateEnv(
  {
    PORT: { type: "number", required: true },
  },
  { PORT: "3000" },
);
```

By default, `validateEnv()` reads `process.env`.

## Error Handling

Invalid or missing required variables produce an error
listing all detected problems.

## License

MIT
