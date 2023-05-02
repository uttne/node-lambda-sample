import * as esbuild from 'esbuild'

const result = await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: "dist/index.js",
    platform: "node",
    target: "node18",
    external: ["aws-sdk", "better-sqlite3"],
});

console.log(result);
