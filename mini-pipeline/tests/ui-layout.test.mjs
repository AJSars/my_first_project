import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import test from "node:test";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");

function sectionInner(htmlStr, testId) {
  const re = new RegExp(
    `<section[^>]*data-testid="${testId}"[^>]*>([\\s\\S]*?)</section>`,
    "i"
  );
  const m = htmlStr.match(re);
  assert.ok(m, "section with data-testid=" + testId);
  return m[1];
}

test("main-controls region has create, link, load, save, and delete wiring", () => {
  const main = sectionInner(html, "main-controls");
  for (const id of [
    "new-process-label",
    "btn-add-process",
    "new-file-label",
    "btn-add-file",
    "link-process",
    "link-file",
    "btn-add-link",
    "btn-delete-selection",
    "btn-load-sample",
    "btn-pick-file",
    "btn-save-export",
    "file-json",
    "status-msg",
  ]) {
    assert.match(main, new RegExp(`id="${id}"`), "main should include #" + id);
  }
});

test("graph-controls has only Reset zoom and Cleanup — no load/save/create/link", () => {
  const graph = sectionInner(html, "graph-controls");
  const forbidden = [
    "btn-add-process",
    "btn-add-file",
    "btn-add-link",
    "btn-load-sample",
    "btn-pick-file",
    "btn-save-export",
    "file-json",
    "link-process",
    "link-file",
    "new-process-label",
    "new-file-label",
    "btn-delete-selection",
  ];
  for (const id of forbidden) {
    assert.ok(!graph.includes(`id="${id}"`), "graph region must not include #" + id);
  }
  assert.match(graph, /id="btn-reset-zoom"/);
  assert.match(graph, /id="btn-cleanup"/);
});

test("README documents main vs graph areas and automated tests", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.match(readme, /main controls|Main controls/i);
  assert.match(readme, /graph controls|Graph controls/i);
  assert.match(readme, /Export|Save.*JSON/i);
  assert.match(readme, /npm test|node --test/);
});
