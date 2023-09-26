export type CopyRule = {
  from: string;
  to: string
}

export const isMatchPattern = (pattern: string, path: string): boolean => {
  return (new RegExp(pattern, "i")).test(path)
}

export const replaceFilePath = (matchPatternStr: string, destinationPattern: string, path: string): string => {
  const matchPattern = new RegExp(matchPatternStr, "i")
  return path.replace(matchPattern, destinationPattern)
}
