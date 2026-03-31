import test from "node:test";
import assert from "node:assert/strict";
import { buildV2Export } from "../export-v2.mjs";
import {
  validateV2Payload,
  normalizeV2Diagram,
  layoutCoordsFromPayload,
} from "../bipartite-rules.mjs";

const goldenState = {
  processes: [{ id: "p-a", label: "Proc A", detail: "d1" }],
  files: [{ id: "f-b", label: "File B", detail: "" }],
  links: [{ id: "L1", processId: "p-a", fileId: "f-b" }],
};

const goldenPosP = { "p-a": { x: 12, y: 34 } };
const goldenPosF = { "f-b": { x: 156, y: 78 } };

test("buildV2Export produces payload that passes validateV2Payload", () => {
  const out = buildV2Export(goldenState, goldenPosP, goldenPosF);
  assert.equal(out.version, 2);
  assert.equal(validateV2Payload(out), null);
  assert.equal(out.processes[0].x, 12);
  assert.equal(out.files[0].y, 78);
});

test("buildV2Export normalizes missing detail to empty string", () => {
  const posP = { p1: { x: 0, y: 0 } };
  const posF = { f1: { x: 1, y: 2 } };
  const out = buildV2Export(
    {
      processes: [{ id: "p1", label: "P", detail: null }],
      files: [{ id: "f1", label: "F" }],
      links: [{ id: "x", processId: "p1", fileId: "f1" }],
    },
    posP,
    posF
  );
  assert.equal(out.processes[0].detail, "");
  assert.equal(out.files[0].detail, "");
  assert.equal(validateV2Payload(out), null);
});

test("export then logical normalize ignores coordinates on entities", () => {
  const out = buildV2Export(goldenState, goldenPosP, goldenPosF);
  const diagram = normalizeV2Diagram(out);
  assert.equal(diagram.processes[0].id, "p-a");
  assert.ok(!("x" in diagram.processes[0]));
  assert.ok(!("y" in diagram.files[0]));
});

test("exported JSON round-trips layout coordinates", () => {
  const out = buildV2Export(goldenState, goldenPosP, goldenPosF);
  assert.equal(validateV2Payload(out), null);
  const { posProcess, posFile } = layoutCoordsFromPayload(out);
  assert.deepEqual(posProcess["p-a"], { x: 12, y: 34 });
  assert.deepEqual(posFile["f-b"], { x: 156, y: 78 });
});
