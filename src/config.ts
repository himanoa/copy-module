import { CopyRule } from "./copy-rule";

export type Config = {
  rules: ReadonlyArray<CopyRule>,
  ignorePatterns: ReadonlyArray<string>,
  entryPoints: ReadonlyArray<string>,
}
