# feat: implement schema validator helper

## Summary of Changes

Adds a lightweight Node.js utility module for validating that a plain object
contains the required string fields `id` and `name`.

| File | Change |
|------|--------|
| `workshop-apps/lab-2-git-demo/src/utils/validator.js` | New file — `validateSchema()` function |

### What `validateSchema` does
- Returns `{ valid: true, errors: [] }` when the object has both `id` and `name` as non-empty strings.
- Returns `{ valid: false, errors: [...] }` with a descriptive message for each violation:
  - Input is not a plain object.
  - Required field is missing.
  - Required field is not a string.
  - Required field is present but empty.

### Usage example
```js
const { validateSchema } = require('./src/utils/validator');

validateSchema({ id: 'u1', name: 'Alice' });
// → { valid: true, errors: [] }

validateSchema({ id: 42 });
// → { valid: false, errors: ['Field "id" must be a string, got number.', 'Missing required field: "name".'] }
```

## Breaking Changes

None. This is a new, self-contained module with no existing callers.

## Testing Checklist

- [ ] Pass a valid object → `valid: true`, `errors` is empty.
- [ ] Pass an object with a missing `name` → `valid: false`, error mentions `"name"`.
- [ ] Pass an object where `id` is a number → `valid: false`, error mentions type mismatch.
- [ ] Pass an object with an empty string for `name` → `valid: false`, error mentions empty string.
- [ ] Pass `null` / an array / a primitive → `valid: false`, error mentions "must be a plain object".
