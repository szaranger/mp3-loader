// test/mp3-loader.test.js
const path = require("path");
const webpack = require("webpack");
const { createFsFromVolume, Volume } = require("memfs");

// A custom wrapper to promisify webpack compilation.
function compileAsync(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error || stats.hasErrors()) {
        const resolvedError = error || stats.toJson("errors-only")[0];
        reject(resolvedError.message);
      }
      resolve(stats);
    });
  });
}
it('converts "*.mp3" import into an audio player', async () => {
  // Configure a webpack compiler.
  const compiler = webpack({
    mode: "development",
    entry: path.resolve(__dirname, "../src/index.js"),
    output: {
      filename: "index.js",
    },
    module: {
      rules: [
        {
          test: /\.mp3$/,
          use: ["babel-loader", require.resolve("../src/mp3-loader.js")],
        },
        {
          test: /\.js$/,
          use: ["babel-loader"],
        },
      ],
    },
  });
  // Create an in-memory file system so that the build assets
  // are not emitted to disk during test runs.
  const memoryFs = createFsFromVolume(new Volume());
  compiler.outputFileSystem = memoryFs;
  // Compile the bundle.
  await compileAsync(compiler);
  // Expect the imported audio file to be emitted alongside the build.
  expect(compiler.outputFileSystem.existsSync("dist/audio.mp3")).toEqual(true);
  // Expect the compiled code to create an "audio" element in React.
  const compiledCode = compiler.outputFileSystem.readFileSync(
    "dist/index.js",
    "utf8"
  );
  expect(compiledCode).toContain('.createElement(\\"audio\\"');
});
