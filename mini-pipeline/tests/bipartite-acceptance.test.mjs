import test from "node:test";
import assert from "node:assert/strict";
import {
  validateBipartiteLink,
  validateAllLinks,
  graphStructuralKey,
  duplicateLinkPairExists,
  validateV2Payload,
  layoutCoordsFromPayload,
} from "../bipartite-rules.mjs";

const pset = new Set(["p1", "p2"]);
const fset = new Set(["f1", "f2"]);

test("valid Process–File link passes validation", () => {
  assert.equal(validateBipartiteLink("p1", "f1", pset, fset), null);
});

test("unknown processId is blocked", () => {
  assert.match(validateBipartiteLink("p9", "f1", pset, fset), /processId/);
});

test("unknown fileId is blocked", () => {
  assert.match(validateBipartiteLink("p1", "f9", pset, fset), /fileId/);
});

test("fileId that names a Process is blocked (same-partition / Process–Process attempt)", () => {
  const px = new Set(["p1", "shared"]);
  const fx = new Set(["f1", "shared"]);
  assert.match(
    validateBipartiteLink("p1", "shared", px, fx),
    /fileId MUST NOT name a Process/
  );
});

test("processId that names a File is blocked (same-partition / File–File attempt)", () => {
  const px = new Set(["p1", "shared"]);
  const fx = new Set(["f1", "shared"]);
  assert.match(
    validateBipartiteLink("shared", "f1", px, fx),
    /processId MUST NOT name a File/i
  );
});

test("validateAllLinks rejects duplicate link pairs", () => {
  const bad = {
    processes: [{ id: "p1" }],
    files: [{ id: "f1" }],
    links: [
      { processId: "p1", fileId: "f1" },
      { processId: "p1", fileId: "f1" },
    ],
  };
  assert.ok(duplicateLinkPairExists(bad.links));
  assert.match(validateAllLinks(bad), /Duplicate/);
});

test("structural key unchanged when only layout fields are added (Cleanup data invariant)", () => {
  const core = {
    processes: [
      { id: "p1", label: "A", detail: "" },
      { id: "p2", label: "B", detail: "" },
    ],
    files: [{ id: "f1", label: "data.bin", detail: "" }],
    links: [{ processId: "p1", fileId: "f1" }],
  };
  const before = graphStructuralKey(core);
  const afterDiagram = JSON.parse(JSON.stringify(core));
  afterDiagram.processes.forEach(function (p) {
    p.x = 10;
    p.y = 20;
  });
  afterDiagram.files.forEach(function (f) {
    f.x = 100;
    f.y = 50;
  });
  const after = graphStructuralKey({
    processes: afterDiagram.processes.map(function (p) {
      return { id: p.id, label: p.label, detail: p.detail };
    }),
    files: afterDiagram.files.map(function (f) {
      return { id: f.id, label: f.label, detail: f.detail };
    }),
    links: afterDiagram.links.slice(),
  });
  assert.equal(before, after, "Cleanup MUST NOT change process/file/link identity");
});

test("v2 without coordinates still validates", () => {
  const data = {
    version: 2,
    processes: [{ id: "p1", label: "P", detail: "" }],
    files: [{ id: "f1", label: "F", detail: "" }],
    links: [{ processId: "p1", fileId: "f1" }],
  };
  assert.equal(validateV2Payload(data), null);
});

test("v2 rejects mixed layout when one side omits coordinates", () => {
  const data = {
    version: 2,
    processes: [{ id: "p1", label: "P", detail: "", x: 1, y: 2 }],
    files: [{ id: "f1", label: "F", detail: "" }],
    links: [{ processId: "p1", fileId: "f1" }],
  };
  assert.match(validateV2Payload(data), /every File must have finite x and y/i);
});

test("layoutCoordsFromPayload reads saved x and y", () => {
  const data = {
    version: 2,
    processes: [{ id: "p1", label: "P", detail: "", x: 10, y: 20 }],
    files: [{ id: "f1", label: "F", detail: "", x: 100, y: 200 }],
    links: [{ processId: "p1", fileId: "f1" }],
  };
  assert.equal(validateV2Payload(data), null);
  const { posProcess, posFile } = layoutCoordsFromPayload(data);
  assert.deepEqual(posProcess.p1, { x: 10, y: 20 });
  assert.deepEqual(posFile.f1, { x: 100, y: 200 });
});

test("line attachment invariant (model): links reference same ids after simulated drag", () => {
  const diagram = {
    processes: [{ id: "p1", label: "P", detail: "" }],
    files: [{ id: "f1", label: "F", detail: "" }],
    links: [{ processId: "p1", fileId: "f1" }],
  };
  const keyBefore = graphStructuralKey(diagram);
  diagram.processes[0].x = 999;
  diagram.processes[0].y = -40;
  assert.equal(validateAllLinks(diagram), null);
  const keyAfter = graphStructuralKey(diagram);
  assert.equal(keyBefore, keyAfter, "Dragging MUST update coordinates only; links stay attached by id");
});
