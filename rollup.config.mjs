import typescript from '@rollup/plugin-typescript'
import shebang from 'rollup-plugin-add-shebang';

export default {
  input: 'src/cli.ts',
  output: [
    {
      file: 'dist/cli.js',
      format: 'cjs'
    },
  ],
  plugins: [typescript(), shebang()],
}
