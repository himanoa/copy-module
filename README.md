## dependencies-based-clone

A tool to clone TypeScript source files into a separate directory based on dependency relationships and rules.

### How to use

1. Initialize the configuration:

```bash
npx @himanoa/dependencies-based-clone init-config
```
2. Open dbc.config.json with your editor.
3. Define your copy rules:
  - from: A regular expression that matches the source files you want to clone.
  - to: The destination file name. You can use placeholders like $1 which will expand groups defined in the from regex.

Example:

```json
{
  "rules": [{
    "from": "path/to/source/(.*)\.ts",
    "to": "path/to/destination/$1.js"
  }]
}
```

4. Execute the clone:

```bash
npx @himanoa/dependencies-based-clone clone src/index.ts
```


This will start from src/index.ts, resolve its imports, and recursively clone files based on your rules.
