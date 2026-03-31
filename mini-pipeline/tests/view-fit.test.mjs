import test from "node:test";
import assert from "node:assert/strict";
import {
  computeViewBoxFit,
  lineEndpointsForFit,
} from "../view-fit.mjs";

const NR = 28;
const FILE_W = 120;
const FILE_H = 48;
const MARGIN = 48;

test("empty diagram uses default viewBox", () => {
  const vb = computeViewBoxFit({
    processes: [],
    files: [],
    links: [],
    posProcess: {},
    posFile: {},
    nodeR: NR,
    fileW: FILE_W,
    fileH: FILE_H,
    margin: MARGIN,
    emptyWidth: 400,
    emptyHeight: 300,
  });
  assert.deepEqual(vb, { x: 0, y: 0, w: 400, h: 300 });
});

test("fit view contains Processes, Files, and link segment with margin", () => {
  const processes = [{ id: "p1" }];
  const files = [{ id: "f1" }];
  const links = [{ processId: "p1", fileId: "f1" }];
  const posProcess = { p1: { x: 100, y: 100 } };
  const posFile = { f1: { x: 400, y: 100 } };
  const seg = lineEndpointsForFit(
    posProcess.p1.x,
    posProcess.p1.y,
    posFile.f1.x,
    posFile.f1.y,
    NR,
    FILE_W,
    FILE_H
  );
  const vb = computeViewBoxFit({
    processes,
    files,
    links,
    posProcess,
    posFile,
    nodeR: NR,
    fileW: FILE_W,
    fileH: FILE_H,
    margin: MARGIN,
    strokePad: 3,
  });
  const pad = 3;
  const minGX = Math.min(posProcess.p1.x, posFile.f1.x, seg.x1 - pad, seg.x2 - pad);
  const maxGX = Math.max(
    posProcess.p1.x + 2 * NR,
    posFile.f1.x + FILE_W,
    seg.x1 + pad,
    seg.x2 + pad
  );
  const minGY = Math.min(posProcess.p1.y, posFile.f1.y, seg.y1 - pad, seg.y2 - pad);
  const maxGY = Math.max(
    posProcess.p1.y + 2 * NR,
    posFile.f1.y + FILE_H,
    seg.y1 + pad,
    seg.y2 + pad
  );
  assert.ok(vb.x <= minGX - MARGIN + 1e-6, "left margin");
  assert.ok(vb.y <= minGY - MARGIN + 1e-6, "top margin");
  assert.ok(vb.x + vb.w >= maxGX + MARGIN - 1e-6, "right margin");
  assert.ok(vb.y + vb.h >= maxGY + MARGIN - 1e-6, "bottom margin");
});

test("computeViewBoxFit does not mutate position maps", () => {
  const posProcess = { p1: { x: 10, y: 20 } };
  const posFile = { f1: { x: 200, y: 30 } };
  const beforeP = JSON.stringify(posProcess);
  const beforeF = JSON.stringify(posFile);
  computeViewBoxFit({
    processes: [{ id: "p1" }],
    files: [{ id: "f1" }],
    links: [{ processId: "p1", fileId: "f1" }],
    posProcess,
    posFile,
    nodeR: NR,
    fileW: FILE_W,
    fileH: FILE_H,
    margin: MARGIN,
  });
  assert.equal(JSON.stringify(posProcess), beforeP);
  assert.equal(JSON.stringify(posFile), beforeF);
});
