import { validateEnv } from "./index.js";

const testResults = [];

function runTest(category, name, fn) {
  try {
    const result = fn();
    testResults.push({ category, name, status: "PASS", details: result });
  } catch (error) {
    testResults.push({ category, name, status: "FAIL", error: error.message, stack: error.stack });
  }
}

function expectThrow(fn, expectedErrorType, messageIncludes) {
  try {
    fn();
    return { success: false, reason: "Did not throw as expected" };
  } catch (err) {
    if (expectedErrorType && !(err instanceof expectedErrorType)) {
      return {
        success: false,
        reason: `Expected ${expectedErrorType.name}, got ${err.constructor.name}: ${err.message}`,
      };
    }
    if (messageIncludes && !err.message.includes(messageIncludes)) {
      return {
        success: false,
        reason: `Error message "${err.message}" did not contain "${messageIncludes}"`,
      };
    }
    return { success: true, caughtMessage: err.message };
  }
}

// ==========================================
// 1. Schema Argument Validation
// ==========================================
runTest("Schema Validation", "null schema throws TypeError", () => {
  const res = expectThrow(() => validateEnv(null, {}), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "undefined schema throws TypeError", () => {
  const res = expectThrow(() => validateEnv(undefined, {}), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "no arguments throws TypeError", () => {
  const res = expectThrow(() => validateEnv(), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "string schema throws TypeError", () => {
  const res = expectThrow(() => validateEnv("schema", {}), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "number schema throws TypeError", () => {
  const res = expectThrow(() => validateEnv(123, {}), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "NaN schema throws TypeError", () => {
  const res = expectThrow(() => validateEnv(NaN, {}), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "boolean schema throws TypeError", () => {
  const res = expectThrow(() => validateEnv(true, {}), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "array schema throws TypeError", () => {
  const res = expectThrow(() => validateEnv([], {}), TypeError, "expects a schema object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Schema Validation", "empty schema object returns empty object", () => {
  const res = validateEnv({}, {});
  if (Object.keys(res).length !== 0) throw new Error("Expected empty object");
  return "OK";
});

runTest("Schema Validation", "Object.create(null) schema works", () => {
  const schema = Object.create(null);
  schema.FOO = { type: "string" };
  const res = validateEnv(schema, { FOO: "bar" });
  if (res.FOO !== "bar") throw new Error("Expected FOO: bar");
  return "OK";
});

runTest("Schema Validation", "frozen schema object works", () => {
  const schema = Object.freeze({ FOO: Object.freeze({ type: "string" }) });
  const res = validateEnv(schema, { FOO: "bar" });
  if (res.FOO !== "bar") throw new Error("Expected FOO: bar");
  return "OK";
});

// ==========================================
// 2. Schema Rule Definition Validation
// ==========================================
runTest("Rule Definition", "null rule throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: null }, {}), Error, "FOO must have a valid schema rule");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "undefined rule throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: undefined }, {}), Error, "FOO must have a valid schema rule");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "primitive rule (string) throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: "string" }, {}), Error, "FOO must have a valid schema rule");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "primitive rule (number) throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: 123 }, {}), Error, "FOO must have a valid schema rule");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "array rule throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: ["string"] }, {}), Error, "FOO must have a valid schema rule");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "unsupported type 'object' throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "object" } }, {}), Error, "FOO has an unsupported type: object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "unsupported type 'integer' throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "integer" } }, {}), Error, "FOO has an unsupported type: integer");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "unsupported type 'bool' throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "bool" } }, {}), Error, "FOO has an unsupported type: bool");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "uppercase type throws Error (case-sensitivity)", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "STRING" } }, {}), Error, "FOO has an unsupported type: STRING");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "missing type property throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: {} }, {}), Error, "FOO has an unsupported type: undefined");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "non-boolean required field (number 1) throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "string", required: 1 } }, {}), Error, "FOO.required must be a boolean");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "non-boolean required field (string 'true') throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "string", required: "true" } }, {}), Error, "FOO.required must be a boolean");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Rule Definition", "non-boolean required field (null) throws Error", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "string", required: null } }, {}), Error, "FOO.required must be a boolean");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

// ==========================================
// 3. Environment Argument Validation
// ==========================================
runTest("Env Argument", "null env throws TypeError", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "string" } }, null), TypeError, "expects an environment object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Env Argument", "undefined env falls back to process.env", () => {
  process.env.__TEST_ENVCHECKR_FALLBACK__ = "exists";
  try {
    const res = validateEnv({ __TEST_ENVCHECKR_FALLBACK__: { type: "string" } });
    if (res.__TEST_ENVCHECKR_FALLBACK__ !== "exists") throw new Error("Fallback failed");
    return "OK";
  } finally {
    delete process.env.__TEST_ENVCHECKR_FALLBACK__;
  }
});

runTest("Env Argument", "string env throws TypeError", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "string" } }, "not-an-object"), TypeError, "expects an environment object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Env Argument", "number env throws TypeError", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "string" } }, 12345), TypeError, "expects an environment object");
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Env Argument", "array env - should reject array as environment", () => {
  const res = expectThrow(() => validateEnv({ FOO: { type: "string" } }, []), TypeError, "expects an environment object");
  if (!res.success) throw new Error(`Array env was accepted without TypeError! (${res.reason})`);
  return "OK";
});

// ==========================================
// 4. Non-String Values in env Object (Crash Bugs)
// ==========================================
runTest("Non-String Env Values", "number value in env (e.g. PORT: 3000)", () => {
  const res = validateEnv({ PORT: { type: "number" } }, { PORT: 3000 });
  if (res.PORT !== 3000) throw new Error("Expected PORT to be 3000");
  return res;
});

runTest("Non-String Env Values", "boolean value in env (e.g. DEBUG: true)", () => {
  const res = validateEnv({ DEBUG: { type: "boolean" } }, { DEBUG: true });
  if (res.DEBUG !== true) throw new Error("Expected DEBUG to be true");
  return res;
});

runTest("Non-String Env Values", "null value in env (e.g. FOO: null)", () => {
  const res = validateEnv({ FOO: { type: "string" } }, { FOO: null });
  return res;
});

runTest("Non-String Env Values", "object value in env (e.g. DATA: {})", () => {
  const res = validateEnv({ DATA: { type: "string" } }, { DATA: {} });
  return res;
});

runTest("Non-String Env Values", "array value in env (e.g. LIST: [1, 2])", () => {
  const res = validateEnv({ LIST: { type: "string" } }, { LIST: [1, 2] });
  return res;
});

// ==========================================
// 5. Prototype Collision & Safety
// ==========================================
runTest("Prototype Collision", "validating 'toString' property with default env", () => {
  const res = validateEnv({ toString: { type: "string", required: false } });
  return res;
});

runTest("Prototype Collision", "validating 'valueOf' property with empty object env", () => {
  const res = validateEnv({ valueOf: { type: "string", required: false } }, {});
  return res;
});

runTest("Prototype Collision", "validating 'hasOwnProperty' property with empty object env", () => {
  const res = validateEnv({ hasOwnProperty: { type: "string", required: false } }, {});
  return res;
});

runTest("Prototype Collision", "validating 'constructor' property with empty object env", () => {
  const res = validateEnv({ constructor: { type: "string", required: false } }, {});
  return res;
});

runTest("Prototype Collision", "prototype pollution check: does setting __proto__ pollute Object?", () => {
  const schema = JSON.parse('{"__proto__": {"type": "string"}}');
  const maliciousEnv = JSON.parse('{"__proto__": "polluted"}');
  const res = validateEnv(schema, maliciousEnv);
  if (Object.prototype.polluted !== undefined) {
    throw new Error("Prototype pollution detected on Object.prototype!");
  }
  if (!Object.hasOwn(res, "__proto__")) {
    throw new Error("Expected __proto__ to be preserved as an own property");
  }
  if (res.__proto__ !== "polluted") {
    throw new Error(`Expected res.__proto__ to be 'polluted', got: ${res.__proto__}`);
  }
  return "Safe: Object.prototype not polluted and __proto__ preserved as own property";
});

runTest("Prototype Collision", "returned object hasOwnProperty call", () => {
  const res = validateEnv({ FOO: { type: "string" } }, { FOO: "bar" });
  if (typeof res.hasOwnProperty !== "function") {
    throw new Error("res.hasOwnProperty is not a function (Object.create(null) breaks method access)");
  }
  if (!res.hasOwnProperty("FOO")) {
    throw new Error("Expected res.hasOwnProperty('FOO') to be true");
  }
  return "Standard prototype";
});

// ==========================================
// 6. String Type Validation & Edge Cases
// ==========================================
runTest("String Validation", "standard valid string", () => {
  const res = validateEnv({ DB: { type: "string", required: true } }, { DB: "postgres://localhost" });
  if (res.DB !== "postgres://localhost") throw new Error("Mismatch");
  return res.DB;
});

runTest("String Validation", "string preserves leading/trailing whitespace", () => {
  const res = validateEnv({ MSG: { type: "string" } }, { MSG: "  hello world  " });
  if (res.MSG !== "  hello world  ") throw new Error(`Whitespace altered: "${res.MSG}"`);
  return res.MSG;
});

runTest("String Validation", "whitespace-only string when required: true", () => {
  const res = expectThrow(
    () => validateEnv({ MSG: { type: "string", required: true } }, { MSG: "   " }),
    Error,
    "MSG is required"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("String Validation", "whitespace-only string when required: false (omitted vs empty)", () => {
  const res = validateEnv({ MSG: { type: "string", required: false } }, { MSG: "   " });
  if ("MSG" in res) throw new Error("Whitespace string was not omitted");
  return "Omitted as expected";
});

runTest("String Validation", "empty string '' when required: true", () => {
  const res = expectThrow(
    () => validateEnv({ MSG: { type: "string", required: true } }, { MSG: "" }),
    Error,
    "MSG is required"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("String Validation", "empty string '' when required: false", () => {
  const res = validateEnv({ MSG: { type: "string", required: false } }, { MSG: "" });
  if ("MSG" in res) throw new Error("Empty string was not omitted");
  return "Omitted as expected";
});

runTest("String Validation", "multiline string with newlines and tabs", () => {
  const val = "line1\nline2\tline3";
  const res = validateEnv({ MULTI: { type: "string" } }, { MULTI: val });
  if (res.MULTI !== val) throw new Error("Multiline mismatch");
  return "OK";
});

runTest("String Validation", "special chars and emojis in string", () => {
  const val = "🚀 ~!@#$%^&*()_+`-={}|[]\\:\";'<>?,./";
  const res = validateEnv({ STR: { type: "string" } }, { STR: val });
  if (res.STR !== val) throw new Error("Special chars mismatch");
  return "OK";
});

runTest("String Validation", "string with value '0' is preserved as string", () => {
  const res = validateEnv({ STR: { type: "string" } }, { STR: "0" });
  if (res.STR !== "0") throw new Error(`Expected '0', got ${res.STR}`);
  return "OK";
});

runTest("String Validation", "string with value 'false' is preserved as string", () => {
  const res = validateEnv({ STR: { type: "string" } }, { STR: "false" });
  if (res.STR !== "false") throw new Error(`Expected 'false', got ${res.STR}`);
  return "OK";
});

// ==========================================
// 7. Number Type Validation & Edge Cases
// ==========================================
runTest("Number Validation", "integer '42'", () => {
  const res = validateEnv({ PORT: { type: "number" } }, { PORT: "42" });
  if (res.PORT !== 42) throw new Error(`Expected 42, got ${res.PORT}`);
  return res.PORT;
});

runTest("Number Validation", "negative integer '-42'", () => {
  const res = validateEnv({ TEMP: { type: "number" } }, { TEMP: "-42" });
  if (res.TEMP !== -42) throw new Error(`Expected -42, got ${res.TEMP}`);
  return res.TEMP;
});

runTest("Number Validation", "positive with sign '+42'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "+42" });
  if (res.NUM !== 42) throw new Error(`Expected 42, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "zero '0'", () => {
  const res = validateEnv({ ZERO: { type: "number" } }, { ZERO: "0" });
  if (res.ZERO !== 0) throw new Error(`Expected 0, got ${res.ZERO}`);
  return res.ZERO;
});

runTest("Number Validation", "negative zero '-0'", () => {
  const res = validateEnv({ ZERO: { type: "number" } }, { ZERO: "-0" });
  if (!Object.is(res.ZERO, -0)) throw new Error(`Expected -0, got ${res.ZERO}`);
  return res.ZERO;
});

runTest("Number Validation", "decimal '3.14159'", () => {
  const res = validateEnv({ PI: { type: "number" } }, { PI: "3.14159" });
  if (res.PI !== 3.14159) throw new Error(`Expected 3.14159, got ${res.PI}`);
  return res.PI;
});

runTest("Number Validation", "leading dot decimal '.5'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: ".5" });
  if (res.NUM !== 0.5) throw new Error(`Expected 0.5, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "signed leading dot '+.5'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "+.5" });
  if (res.NUM !== 0.5) throw new Error(`Expected 0.5, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "trailing dot decimal '5.'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "5." });
  if (res.NUM !== 5) throw new Error(`Expected 5, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "scientific notation '1e6'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "1e6" });
  if (res.NUM !== 1000000) throw new Error(`Expected 1000000, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "scientific notation with negative exponent '2.5e-3'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "2.5e-3" });
  if (res.NUM !== 0.0025) throw new Error(`Expected 0.0025, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "scientific notation uppercase '1E+5'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "1E+5" });
  if (res.NUM !== 100000) throw new Error(`Expected 100000, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "number with leading/trailing spaces '  123  '", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "  123  " });
  if (res.NUM !== 123) throw new Error(`Expected 123, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "leading zero '007'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "007" });
  if (res.NUM !== 7) throw new Error(`Expected 7, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "underflow to zero '1e-400'", () => {
  const res = validateEnv({ NUM: { type: "number" } }, { NUM: "1e-400" });
  if (res.NUM !== 0) throw new Error(`Expected 0, got ${res.NUM}`);
  return res.NUM;
});

runTest("Number Validation", "overflow '1e999' -> finite number check", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "1e999" }),
    Error,
    "NUM must be a finite number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "negative overflow '-1e999' -> finite check", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "-1e999" }),
    Error,
    "NUM must be a finite number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "hexadecimal '0x10' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "0x10" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "binary '0b101' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "0b101" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "octal '0o77' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "0o77" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "NaN string rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "NaN" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "Infinity string rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "Infinity" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "comma-formatted number '1,000' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "1,000" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "trailing letters '42px' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "42px" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "just a dot '.' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "." }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "just a sign '+' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "+" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "sign with dot '+.' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "+." }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "multiple dots '1.2.3' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "1.2.3" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "broken exponent '1e' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "1e" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Number Validation", "exponent without mantissa 'e5' rejected", () => {
  const res = expectThrow(
    () => validateEnv({ NUM: { type: "number" } }, { NUM: "e5" }),
    Error,
    "NUM must be a number"
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

// ==========================================
// 8. Boolean Type Validation & Edge Cases
// ==========================================
runTest("Boolean Validation", "lowercase 'true' -> true", () => {
  const res = validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "true" });
  if (res.FLAG !== true) throw new Error("Expected true");
  return res.FLAG;
});

runTest("Boolean Validation", "lowercase 'false' -> false", () => {
  const res = validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "false" });
  if (res.FLAG !== false) throw new Error("Expected false");
  return res.FLAG;
});

runTest("Boolean Validation", "uppercase 'TRUE' -> true", () => {
  const res = validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "TRUE" });
  if (res.FLAG !== true) throw new Error("Expected true");
  return res.FLAG;
});

runTest("Boolean Validation", "mixed case 'False' -> false", () => {
  const res = validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "False" });
  if (res.FLAG !== false) throw new Error("Expected false");
  return res.FLAG;
});

runTest("Boolean Validation", "with whitespace '  true  ' -> true", () => {
  const res = validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "  true  " });
  if (res.FLAG !== true) throw new Error("Expected true");
  return res.FLAG;
});

runTest("Boolean Validation", "'1' as boolean rejected", () => {
  const res = expectThrow(
    () => validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "1" }),
    Error,
    'FLAG must be "true" or "false"'
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Boolean Validation", "'0' as boolean rejected", () => {
  const res = expectThrow(
    () => validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "0" }),
    Error,
    'FLAG must be "true" or "false"'
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Boolean Validation", "'yes' as boolean rejected", () => {
  const res = expectThrow(
    () => validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "yes" }),
    Error,
    'FLAG must be "true" or "false"'
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Boolean Validation", "'no' as boolean rejected", () => {
  const res = expectThrow(
    () => validateEnv({ FLAG: { type: "boolean" } }, { FLAG: "no" }),
    Error,
    'FLAG must be "true" or "false"'
  );
  if (!res.success) throw new Error(res.reason);
  return res.caughtMessage;
});

runTest("Boolean Validation", "optional boolean missing is omitted", () => {
  const res = validateEnv({ FLAG: { type: "boolean", required: false } }, {});
  if ("FLAG" in res) throw new Error("FLAG should be omitted");
  return "Omitted as expected";
});

// ==========================================
// 9. Multiple Errors Aggregation
// ==========================================
runTest("Error Aggregation", "collects multiple distinct errors together", () => {
  const schema = {
    PORT: { type: "number", required: true },
    DEBUG: { type: "boolean", required: true },
    HOST: { type: "string", required: true },
  };
  const env = {
    PORT: "not-a-number",
    DEBUG: "maybe",
    HOST: "",
  };

  const res = expectThrow(() => validateEnv(schema, env), Error);
  if (!res.success) throw new Error("Did not throw");
  const msg = res.caughtMessage;
  if (
    !msg.includes("PORT must be a number") ||
    !msg.includes('DEBUG must be "true" or "false"') ||
    !msg.includes("HOST is required")
  ) {
    throw new Error(`Did not aggregate all 3 errors: ${msg}`);
  }
  return "All 3 errors aggregated";
});

// ==========================================
// 15. STQA Audit Regressions (D1, D2, D3)
// ==========================================
runTest("Audit Regressions", "D1: numeric regex completes without ReDoS backtracking on long input", () => {
  const schema = { N: { type: "number", required: true } };
  const value = "9".repeat(32000) + "x";
  const start = performance.now();
  const res = expectThrow(() => validateEnv(schema, { N: value }), Error, "N must be a number");
  const duration = performance.now() - start;
  if (!res.success) throw new Error(res.reason);
  if (duration > 200) throw new Error(`Regex took too long (${duration.toFixed(2)}ms) - possible ReDoS`);
  return `Completed in ${duration.toFixed(2)}ms`;
});

runTest("Audit Regressions", "D2: __proto__ preserved as own property for number and boolean", () => {
  const schemaNum = JSON.parse('{"__proto__": {"type": "number", "required": true}}');
  const resNum = validateEnv(schemaNum, JSON.parse('{"__proto__": "42"}'));
  if (!Object.hasOwn(resNum, "__proto__") || resNum.__proto__ !== 42) {
    throw new Error("Failed to preserve __proto__ as own number property");
  }

  const schemaBool = JSON.parse('{"__proto__": {"type": "boolean", "required": true}}');
  const resBool = validateEnv(schemaBool, JSON.parse('{"__proto__": "true"}'));
  if (!Object.hasOwn(resBool, "__proto__") || resBool.__proto__ !== true) {
    throw new Error("Failed to preserve __proto__ as own boolean property");
  }

  return "Passed for number and boolean";
});

runTest("Audit Regressions", "D3: malformed schema type object aggregates errors without throwing TypeError", () => {
  const schema = JSON.parse(`{
    "BEFORE": {"type": "string", "required": true},
    "BAD": {"type": {"toString": null}},
    "AFTER": {"type": "boolean", "required": true}
  }`);
  const res = expectThrow(() => validateEnv(schema, {}), Error);
  if (!res.success) throw new Error(res.reason);
  const msg = res.caughtMessage;
  if (!msg.includes("BEFORE is required")) throw new Error("Missing BEFORE error");
  if (!msg.includes("BAD has an unsupported type: object")) throw new Error("Missing BAD error");
  if (!msg.includes("AFTER is required")) throw new Error("Missing AFTER error");
  return "All errors successfully aggregated";
});

// ==========================================
// 16. Options Argument & Update Check
// ==========================================
runTest("Options Validation", "non-object options throws TypeError", () => {
  const res = expectThrow(() => validateEnv({}, {}, "not-an-object"), TypeError, "expects an options object");
  if (!res.success) throw new Error(res.reason);
  return "OK";
});

runTest("Options Validation", "array options throws TypeError", () => {
  const res = expectThrow(() => validateEnv({}, {}, []), TypeError, "expects an options object");
  if (!res.success) throw new Error(res.reason);
  return "OK";
});

runTest("Options Validation", "checkUpdates: false disables update check", () => {
  const res = validateEnv({ PORT: { type: "number" } }, { PORT: "3000" }, { checkUpdates: false });
  if (res.PORT !== 3000) throw new Error("Validation failed");
  return "OK";
});

runTest("Options Validation", "checkUpdates: true executes safely", () => {
  const res = validateEnv({ PORT: { type: "number" } }, { PORT: "3000" }, { checkUpdates: true });
  if (res.PORT !== 3000) throw new Error("Validation failed");
  return "OK";
});

// ==========================================
// Print Summary & Exit Code
// ==========================================
const passes = testResults.filter((t) => t.status === "PASS");
const fails = testResults.filter((t) => t.status === "FAIL");

console.log("\n==========================================");
console.log(`TOTAL TESTS: ${testResults.length}`);
console.log(`PASSED: ${passes.length}`);
console.log(`FAILED: ${fails.length}`);
console.log("==========================================\n");

if (fails.length > 0) {
  console.log("FAILED TESTS DETAILS:");
  fails.forEach((f, idx) => {
    console.log(`\n[${idx + 1}] Category: ${f.category}`);
    console.log(`    Name:     ${f.name}`);
    console.log(`    Error:    ${f.error}`);
  });
  process.exit(1);
} else {
  console.log(`All ${passes.length} tests passed successfully! 🎉\n`);
  process.exit(0);
}
