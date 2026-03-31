import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import test from "node:test";
import assert from "node:assert/strict";
import { graphStructuralKey } from "../bipartite-rules.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
eval(readFileSync(join(root, "graph-geometry.js"), "utf8"));
const G = globalThis.MPDMGeometry;
assert.ok(G, "MPDMGeometry present");

test("rebuildBipartiteCleanup places linked Process before File (one of each)", () => {
  const processes = [{ id: "p1", label: "a", detail: "" }];
  const files = [{ id: "f1", label: "b", detail: "" }];
  const links = [{ processId: "p1", fileId: "f1" }];
  const { processes: pp, files: fp } = G.rebuildBipartiteCleanup(processes, files, links);
  assert.ok(pp.p1.x < fp.f1.x);
  assert.equal(pp.p1.y, G.PAD);
  assert.equal(fp.f1.y, G.PAD);
});

test("explicit acceptance: two Processes, one File, both linked — File x between Process x (not two slabs)", () => {
  const processes = [
    { id: "pa", label: "", detail: "" },
    { id: "pb", label: "", detail: "" },
  ];
  const files = [{ id: "f1", label: "", detail: "" }];
  const links = [
    { processId: "pa", fileId: "f1" },
    { processId: "pb", fileId: "f1" },
  ];
  const { processes: pp, files: fp } = G.rebuildBipartiteCleanup(processes, files, links);
  const pxs = [pp.pa.x, pp.pb.x];
  const minP = Math.min(pxs[0], pxs[1]);
  const maxP = Math.max(pxs[0], pxs[1]);
  assert.notEqual(pp.pa.x, pp.pb.x, "Processes must not share one partition column (same x)");
  assert.ok(fp.f1.x > minP && fp.f1.x < maxP, "File must sit between Processes on x");
});

test("rebuildBipartiteCleanup does not mutate input process/file arrays", () => {
  const processes = [{ id: "p1", label: "x", detail: "y" }];
  const files = [{ id: "f1", label: "q", detail: "" }];
  const p0 = processes[0];
  const f0 = files[0];
  G.rebuildBipartiteCleanup(processes, files, []);
  assert.equal(processes.length, 1);
  assert.equal(files.length, 1);
  assert.strictEqual(processes[0], p0);
  assert.strictEqual(files[0], f0);
  assert.equal(p0.label, "x");
  assert.equal(f0.label, "q");
});

test("placeNewProcess stacks below existing", () => {
  const processes = [
    { id: "p1", label: "a", detail: "" },
    { id: "p2", label: "b", detail: "" },
  ];
  const pos = { p1: { x: G.PAD, y: G.PAD } };
  const p2 = G.placeNewProcess(pos, processes, "p2");
  assert.ok(p2.y > pos.p1.y);
});

test("computeBoundsBipartite includes both partitions", () => {
  const pp = { p1: { x: 0, y: 0 } };
  const fp = { f1: { x: 300, y: 0 } };
  const b = G.computeBoundsBipartite(pp, fp, ["p1"], ["f1"]);
  assert.ok(b.w >= 480);
  assert.ok(b.h >= 320);
});

test("rebuildBipartiteCleanup does not change logical graph identity", () => {
  const processes = [
    { id: "pa", label: "A", detail: "d0" },
    { id: "pb", label: "B", detail: "" },
  ];
  const files = [{ id: "f1", label: "F", detail: "" }];
  const links = [
    { id: "L1", processId: "pa", fileId: "f1" },
    { id: "L2", processId: "pb", fileId: "f1" },
  ];
  const before = graphStructuralKey({ processes, files, links });
  G.rebuildBipartiteCleanup(processes, files, links);
  const after = graphStructuralKey({ processes, files, links });
  assert.equal(before, after);
  assert.equal(processes[0].label, "A");
  assert.equal(processes[0].detail, "d0");
});
