/* Build the static export with the GitHub Pages base path and publish
   out/ to the gh-pages branch. Run with: npm run deploy:pages
   (A CI workflow would be nicer, but pushing workflow files needs the
   `workflow` OAuth scope — run `gh auth refresh -s workflow` first if you
   ever want to switch to Actions.) */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const run = (cmd) =>
  execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "/premier-eye-institute" },
  });

run("npx next build");
// Pages runs Jekyll on legacy branch deploys, which drops _next/ (underscore
// dirs) — .nojekyll turns that off.
writeFileSync("out/.nojekyll", "");
run("npx gh-pages -d out -t");
console.log(
  "\nDeployed. Live in ~a minute at https://ishaanpthegoat.github.io/premier-eye-institute/"
);
