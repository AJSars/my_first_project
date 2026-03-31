import {
  validateV2Payload,
  normalizeV2Diagram,
  validateBipartiteLink,
  validateAllLinks,
  payloadHasFullLayout,
  layoutCoordsFromPayload,
} from "./bipartite-rules.mjs";
import { buildV2Export } from "./export-v2.mjs";
import { computeViewBoxFit, lineEndpointsForFit } from "./view-fit.mjs";

const G = globalThis.MPDMGeometry;
if (!G) {
  throw new Error("MPDMGeometry missing: load graph-geometry.js before app.js (non-module script first).");
}

const NR = G.NODE_R;
const FILE_W = G.FILE_W;
const FILE_H = G.FILE_H;

/** v2 sample — inlined for file:// */
const SAMPLE_PIPELINE = {
  version: 2,
  processes: [
    { id: "ingest", label: "Raw ingest", detail: "Landing zone" },
    { id: "clean", label: "Clean & validate", detail: "Schema checks" },
    { id: "features", label: "Feature build", detail: "Derived columns" },
    { id: "train", label: "Train model", detail: "Offline job" },
    { id: "report", label: "Report", detail: "Summary artifact" },
  ],
  files: [
    { id: "f-events", label: "events.jsonl", detail: "" },
    { id: "f-feat", label: "features.parquet", detail: "" },
    { id: "f-train", label: "training_set.parquet", detail: "" },
    { id: "f-out", label: "model.pkl + metrics.json", detail: "" },
  ],
  links: [
    { processId: "ingest", fileId: "f-events" },
    { processId: "clean", fileId: "f-events" },
    { processId: "clean", fileId: "f-feat" },
    { processId: "features", fileId: "f-feat" },
    { processId: "features", fileId: "f-train" },
    { processId: "train", fileId: "f-train" },
    { processId: "train", fileId: "f-out" },
    { processId: "report", fileId: "f-out" },
  ],
};

const state = {
  processes: [],
  files: [],
  links: [],
  /** @type {{ kind: 'process'|'file'|'link'; id: string } | null} */
  selection: null,
};

let posProcess = {};
let posFile = {};

const graphView = {
  userAdjusted: false,
  x: 0,
  y: 0,
  w: 400,
  h: 300,
};

let dragState = null;

function $(id) {
  return document.getElementById(id);
}

function setStatus(msg, isError) {
  const el = $("status-msg");
  el.textContent = msg || "";
  el.classList.toggle("status--error", !!isError);
}

function resetGraphView() {
  graphView.userAdjusted = false;
}

function viewFitOpts() {
  return {
    processes: state.processes,
    files: state.files,
    links: state.links,
    posProcess: posProcess,
    posFile: posFile,
    nodeR: NR,
    fileW: FILE_W,
    fileH: FILE_H,
    margin: G.PAD,
    strokePad: 3,
    emptyWidth: 400,
    emptyHeight: 300,
  };
}

function clampViewBox(layout) {
  const cw = Math.max(400, layout.size.w);
  const ch = Math.max(300, layout.size.h);
  const minW = Math.max(60, cw * 0.04);
  const maxW = Math.max(minW + 1, cw * 10);
  const minH = Math.max(60, ch * 0.04);
  const maxH = Math.max(minH + 1, ch * 10);
  graphView.w = Math.min(maxW, Math.max(minW, graphView.w));
  graphView.h = Math.min(maxH, Math.max(minH, graphView.h));
}

function clientToSvg(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = pt.matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

function computeLayout() {
  if (state.processes.length === 0 && state.files.length === 0) {
    return { size: { w: 400, h: 300 } };
  }
  const pids = state.processes.map(function (p) { return p.id; });
  const fids = state.files.map(function (f) { return f.id; });
  const size = G.computeBoundsBipartite(posProcess, posFile, pids, fids);
  return { size: size };
}

/** Line from process circle edge to file rect edge. */
function lineEndpoints(px, py, fx, fy) {
  return lineEndpointsForFit(px, py, fx, fy, NR, FILE_W, FILE_H);
}

function renderSvg() {
  const svg = $("graph-svg");
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const layout = computeLayout();
  svg.setAttribute("width", String(layout.size.w));
  svg.setAttribute("height", String(layout.size.h));
  if (!graphView.userAdjusted) {
    const fit = computeViewBoxFit(viewFitOpts());
    graphView.x = fit.x;
    graphView.y = fit.y;
    graphView.w = fit.w;
    graphView.h = fit.h;
  } else {
    clampViewBox(layout);
  }
  svg.setAttribute(
    "viewBox",
    graphView.x + " " + graphView.y + " " + graphView.w + " " + graphView.h
  );

  const linkLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  linkLayer.setAttribute("class", "links");

  state.links.forEach(function (L) {
    const pp = posProcess[L.processId];
    const fp = posFile[L.fileId];
    if (!pp || !fp) return;
    const seg = lineEndpoints(pp.x, pp.y, fp.x, fp.y);
    const d = "M " + seg.x1 + " " + seg.y1 + " L " + seg.x2 + " " + seg.y2;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-link-id", L.id);
    const sel =
      state.selection && state.selection.kind === "link" && state.selection.id === L.id;
    g.setAttribute("class", "link-group" + (sel ? " link-selected" : ""));

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.setAttribute("d", d);
    hit.setAttribute("class", "edge-hit");
    hit.setAttribute("stroke-width", "14");
    hit.setAttribute("stroke", "transparent");
    hit.setAttribute("fill", "none");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", d);
    line.setAttribute("class", "edge-line");
    line.setAttribute("stroke", sel ? "#5b9cfa" : "#5a6d85");
    line.setAttribute("stroke-width", sel ? "2.5" : "2");
    line.setAttribute("fill", "none");

    hit.addEventListener("click", function (ev) {
      ev.stopPropagation();
      state.selection = { kind: "link", id: L.id };
      syncUi();
    });
    g.appendChild(hit);
    g.appendChild(line);
    linkLayer.appendChild(g);
  });
  svg.appendChild(linkLayer);

  const procLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  procLayer.setAttribute("class", "processes");
  state.processes.forEach(function (p) {
    const pos = posProcess[p.id];
    if (!pos) return;
    const cx = pos.x + NR;
    const cy = pos.y + NR;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-process-id", p.id);
    const sel =
      state.selection && state.selection.kind === "process" && state.selection.id === p.id;
    g.setAttribute("class", "process-group" + (sel ? " process-selected" : ""));

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(cx));
    circle.setAttribute("cy", String(cy));
    circle.setAttribute("r", String(NR));
    circle.setAttribute("fill", "#243044");
    circle.setAttribute("stroke", sel ? "#5b9cfa" : "#3d526e");
    circle.setAttribute("stroke-width", sel ? "3" : "2");

    const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    lbl.setAttribute("x", String(cx));
    lbl.setAttribute("y", String(cy + 4));
    lbl.setAttribute("text-anchor", "middle");
    lbl.setAttribute("fill", "#e8eef5");
    lbl.setAttribute("font-size", "11");
    lbl.setAttribute("font-weight", "600");
    lbl.setAttribute("pointer-events", "none");
    lbl.textContent = p.label.length > 16 ? p.label.slice(0, 15) + "…" : p.label;

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hit.setAttribute("cx", String(cx));
    hit.setAttribute("cy", String(cy));
    hit.setAttribute("r", String(NR + 8));
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("class", "drag-hit");
    hit.addEventListener("mousedown", function (ev) {
      ev.stopPropagation();
      ev.preventDefault();
      state.selection = { kind: "process", id: p.id };
      startDrag("process", p.id, ev);
      renderSvg();
      syncInspect();
      $("btn-delete-selection").disabled = false;
      syncLinkSelects();
    });
    hit.addEventListener("click", function (ev) {
      ev.stopPropagation();
    });

    g.appendChild(circle);
    g.appendChild(lbl);
    g.appendChild(hit);
    procLayer.appendChild(g);
  });
  svg.appendChild(procLayer);

  const fileLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  fileLayer.setAttribute("class", "files");
  state.files.forEach(function (f) {
    const pos = posFile[f.id];
    if (!pos) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-file-id", f.id);
    const sel =
      state.selection && state.selection.kind === "file" && state.selection.id === f.id;
    g.setAttribute("class", "file-group" + (sel ? " file-selected" : ""));

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(pos.x));
    rect.setAttribute("y", String(pos.y));
    rect.setAttribute("width", String(FILE_W));
    rect.setAttribute("height", String(FILE_H));
    rect.setAttribute("rx", "6");
    rect.setAttribute("fill", "#1e2a3d");
    rect.setAttribute("stroke", sel ? "#5b9cfa" : "#3d526e");
    rect.setAttribute("stroke-width", sel ? "3" : "2");

    const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    lbl.setAttribute("x", String(pos.x + FILE_W / 2));
    lbl.setAttribute("y", String(pos.y + FILE_H / 2 + 4));
    lbl.setAttribute("text-anchor", "middle");
    lbl.setAttribute("fill", "#c5d4e8");
    lbl.setAttribute("font-size", "10");
    lbl.setAttribute("pointer-events", "none");
    lbl.textContent = f.label.length > 18 ? f.label.slice(0, 17) + "…" : f.label;

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    hit.setAttribute("x", String(pos.x - 4));
    hit.setAttribute("y", String(pos.y - 4));
    hit.setAttribute("width", String(FILE_W + 8));
    hit.setAttribute("height", String(FILE_H + 8));
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("class", "drag-hit");
    hit.addEventListener("mousedown", function (ev) {
      ev.stopPropagation();
      ev.preventDefault();
      state.selection = { kind: "file", id: f.id };
      startDrag("file", f.id, ev);
      renderSvg();
      syncInspect();
      $("btn-delete-selection").disabled = false;
      syncLinkSelects();
    });
    hit.addEventListener("click", function (ev) {
      ev.stopPropagation();
    });

    g.appendChild(rect);
    g.appendChild(lbl);
    g.appendChild(hit);
    fileLayer.appendChild(g);
  });
  svg.appendChild(fileLayer);
}

function onDragMove(ev) {
  if (!dragState) return;
  const svg = $("graph-svg");
  const p = clientToSvg(svg, ev.clientX, ev.clientY);
  const dx = p.x - dragState.lastX;
  const dy = p.y - dragState.lastY;
  dragState.lastX = p.x;
  dragState.lastY = p.y;
  if (dragState.kind === "process") {
    const pp = posProcess[dragState.id];
    if (pp) {
      pp.x += dx;
      pp.y += dy;
    }
  } else {
    const fp = posFile[dragState.id];
    if (fp) {
      fp.x += dx;
      fp.y += dy;
    }
  }
  renderSvg();
}

function endDrag() {
  if (!dragState) return;
  dragState = null;
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", endDrag);
  syncUi();
}

function startDrag(kind, id, ev) {
  const svg = $("graph-svg");
  const p = clientToSvg(svg, ev.clientX, ev.clientY);
  dragState = { kind: kind, id: id, lastX: p.x, lastY: p.y };
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", endDrag);
}

function onGraphWheel(ev) {
  if (!ev.ctrlKey) return;
  ev.preventDefault();
  const svg = $("graph-svg");
  const layout = computeLayout();
  let vb = computeViewBoxFit(viewFitOpts());
  if (graphView.userAdjusted) {
    vb = { x: graphView.x, y: graphView.y, w: graphView.w, h: graphView.h };
  }
  const zoomIn = ev.deltaY < 0;
  const sensitivity = Math.min(2.2, Math.max(0.35, Math.abs(ev.deltaY) / 80));
  const mag = zoomIn ? 1 + 0.09 * sensitivity : 1 / (1 + 0.09 * sensitivity);
  const nw = vb.w / mag;
  const nh = vb.h / mag;
  const scr = clientToSvg(svg, ev.clientX, ev.clientY);
  const nx = scr.x - (scr.x - vb.x) * (nw / vb.w);
  const ny = scr.y - (scr.y - vb.y) * (nh / vb.h);
  graphView.userAdjusted = true;
  graphView.x = nx;
  graphView.y = ny;
  graphView.w = nw;
  graphView.h = nh;
  clampViewBox(layout);
  svg.setAttribute(
    "viewBox",
    graphView.x + " " + graphView.y + " " + graphView.w + " " + graphView.h
  );
}

function isTypingInField(target) {
  if (!target || !target.tagName) return false;
  const t = target.tagName.toLowerCase();
  if (t === "textarea" || t === "select") return true;
  if (t === "input") {
    const type = (target.type || "").toLowerCase();
    return (
      type !== "button" &&
      type !== "submit" &&
      type !== "reset" &&
      type !== "checkbox" &&
      type !== "radio" &&
      type !== "file"
    );
  }
  if (target.isContentEditable) return true;
  return false;
}

function cloneDiagramState() {
  return {
    processes: state.processes.map(function (p) { return Object.assign({}, p); }),
    files: state.files.map(function (f) { return Object.assign({}, f); }),
    links: state.links.map(function (l) { return Object.assign({}, l); }),
    selection: state.selection ? Object.assign({}, state.selection) : null,
    posProcess: clonePosMap(posProcess),
    posFile: clonePosMap(posFile),
  };
}

function clonePosMap(m) {
  const o = {};
  Object.keys(m).forEach(function (k) {
    o[k] = { x: m[k].x, y: m[k].y };
  });
  return o;
}

function restoreDiagramState(b) {
  state.processes = b.processes;
  state.files = b.files;
  state.links = b.links;
  state.selection = b.selection;
  posProcess = b.posProcess;
  posFile = b.posFile;
}

function loadGraphFromData(data) {
  const err = validateV2Payload(data);
  if (err) return err;
  const diagram = normalizeV2Diagram(data);
  state.processes = diagram.processes;
  state.files = diagram.files;
  state.links = diagram.links;
  state.selection = null;
  resetGraphView();
  if (payloadHasFullLayout(data)) {
    const coords = layoutCoordsFromPayload(data);
    posProcess = coords.posProcess;
    posFile = coords.posFile;
  } else {
    const laid = G.rebuildBipartiteCleanup(state.processes, state.files, state.links);
    posProcess = laid.processes;
    posFile = laid.files;
  }
  return null;
}

function generateId(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

function syncLinkSelects() {
  const ps = $("link-process");
  const fs = $("link-file");
  const prevP = ps.value;
  const prevF = fs.value;
  ps.innerHTML = "";
  fs.innerHTML = "";
  const o0 = document.createElement("option");
  o0.value = "";
  o0.textContent = "—";
  ps.appendChild(o0.cloneNode(true));
  fs.appendChild(o0.cloneNode(true));
  state.processes.forEach(function (p) {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.label + " (" + p.id + ")";
    ps.appendChild(o);
  });
  state.files.forEach(function (f) {
    const o = document.createElement("option");
    o.value = f.id;
    o.textContent = f.label + " (" + f.id + ")";
    fs.appendChild(o);
  });
  if (state.processes.some(function (p) { return p.id === prevP; })) ps.value = prevP;
  if (state.files.some(function (f) { return f.id === prevF; })) fs.value = prevF;
}

function syncInspect() {
  const empty = $("inspect-empty");
  const body = $("inspect-body");
  const ul = $("inspect-connections");
  const connBlock = $("inspect-conn-block");
  if (!state.selection) {
    empty.hidden = false;
    body.hidden = true;
    return;
  }
  empty.hidden = true;
  body.hidden = false;
  if (state.selection.kind === "process") {
    const p = state.processes.find(function (x) { return x.id === state.selection.id; });
    if (!p) {
      empty.hidden = false;
      body.hidden = true;
      return;
    }
    $("inspect-kind").textContent = "Process";
    $("in-id").textContent = p.id;
    $("in-label").textContent = p.label;
    $("in-detail").textContent = p.detail || "—";
    connBlock.hidden = false;
    ul.innerHTML = "";
    state.links
      .filter(function (L) { return L.processId === p.id; })
      .forEach(function (L) {
        const f = state.files.find(function (x) { return x.id === L.fileId; });
        const li = document.createElement("li");
        li.textContent = "File: " + (f ? f.label : L.fileId) + " (link " + L.id + ")";
        ul.appendChild(li);
      });
    if (!ul.children.length) {
      const li = document.createElement("li");
      li.textContent = "—";
      ul.appendChild(li);
    }
    return;
  }
  if (state.selection.kind === "file") {
    const f = state.files.find(function (x) { return x.id === state.selection.id; });
    if (!f) {
      empty.hidden = false;
      body.hidden = true;
      return;
    }
    $("inspect-kind").textContent = "File";
    $("in-id").textContent = f.id;
    $("in-label").textContent = f.label;
    $("in-detail").textContent = f.detail || "—";
    connBlock.hidden = false;
    ul.innerHTML = "";
    state.links
      .filter(function (L) { return L.fileId === f.id; })
      .forEach(function (L) {
        const pr = state.processes.find(function (x) { return x.id === L.processId; });
        const li = document.createElement("li");
        li.textContent = "Process: " + (pr ? pr.label : L.processId) + " (link " + L.id + ")";
        ul.appendChild(li);
      });
    if (!ul.children.length) {
      const li = document.createElement("li");
      li.textContent = "—";
      ul.appendChild(li);
    }
    return;
  }
  const L = state.links.find(function (x) { return x.id === state.selection.id; });
  if (!L) {
    empty.hidden = false;
    body.hidden = true;
    return;
  }
  $("inspect-kind").textContent = "Link";
  $("in-id").textContent = L.id;
  const pr = state.processes.find(function (x) { return x.id === L.processId; });
  const fi = state.files.find(function (x) { return x.id === L.fileId; });
  $("in-label").textContent = (pr ? pr.label : L.processId) + " ↔ " + (fi ? fi.label : L.fileId);
  $("in-detail").textContent = "—";
  connBlock.hidden = true;
}

function syncUi() {
  const del = $("btn-delete-selection");
  del.disabled = !state.selection;
  syncLinkSelects();
  syncInspect();
  renderSvg();
}

function deleteSelection() {
  if (!state.selection) return;
  if (state.selection.kind === "link") {
    state.links = state.links.filter(function (l) { return l.id !== state.selection.id; });
    setStatus("Deleted link.");
  } else if (state.selection.kind === "process") {
    const id = state.selection.id;
    state.processes = state.processes.filter(function (p) { return p.id !== id; });
    state.links = state.links.filter(function (l) { return l.processId !== id; });
    delete posProcess[id];
    setStatus("Deleted Process and incident links.");
  } else {
    const id = state.selection.id;
    state.files = state.files.filter(function (f) { return f.id !== id; });
    state.links = state.links.filter(function (l) { return l.fileId !== id; });
    delete posFile[id];
    setStatus("Deleted File and incident links.");
  }
  state.selection = null;
  syncUi();
}

function runCleanup() {
  const before = validateAllLinks({
    processes: state.processes,
    files: state.files,
    links: state.links,
  });
  if (before) {
    setStatus(before, true);
    return;
  }
  const laid = G.rebuildBipartiteCleanup(state.processes, state.files, state.links);
  posProcess = laid.processes;
  posFile = laid.files;
  resetGraphView();
  setStatus("Cleanup: layered layout updated. Processes, Files, and links unchanged.");
  syncUi();
}

// ——— Wire UI ———
$("btn-add-process").addEventListener("click", function () {
  const label = $("new-process-label").value.trim() || "Process";
  const id = generateId("proc");
  state.processes.push({ id: id, label: label, detail: "" });
  posProcess[id] = G.placeNewProcess(
    posProcess,
    state.processes,
    id
  );
  $("new-process-label").value = "";
  setStatus("Added Process.");
  syncUi();
});

$("btn-add-file").addEventListener("click", function () {
  const label = $("new-file-label").value.trim() || "File";
  const id = generateId("file");
  state.files.push({ id: id, label: label, detail: "" });
  posFile[id] = G.placeNewFile(posFile, state.files, id);
  $("new-file-label").value = "";
  setStatus("Added File.");
  syncUi();
});

$("btn-add-link").addEventListener("click", function () {
  const pid = $("link-process").value;
  const fid = $("link-file").value;
  if (!pid || !fid) {
    setStatus("Choose a Process and a File to link.", true);
    return;
  }
  const pset = new Set(state.processes.map(function (p) { return p.id; }));
  const fset = new Set(state.files.map(function (f) { return f.id; }));
  const msg = validateBipartiteLink(pid, fid, pset, fset);
  if (msg) {
    setStatus(msg, true);
    return;
  }
  if (
    state.links.some(function (L) { return L.processId === pid && L.fileId === fid; })
  ) {
    setStatus("That Process–File link already exists.", true);
    return;
  }
  state.links.push({
    id: generateId("link"),
    processId: pid,
    fileId: fid,
  });
  setStatus("Added link.");
  syncUi();
});

$("btn-delete-selection").addEventListener("click", deleteSelection);

$("btn-load-sample").addEventListener("click", function () {
  const err = loadGraphFromData(SAMPLE_PIPELINE);
  if (err) {
    setStatus(err, true);
    return;
  }
  setStatus("Loaded sample (v2).");
  syncUi();
});

$("btn-pick-file").addEventListener("click", function () {
  $("file-json").click();
});

$("btn-reset-zoom").addEventListener("click", function () {
  resetGraphView();
  setStatus("Zoom reset: full graph framed with margin (viewport only).");
  syncUi();
});

$("btn-save-export").addEventListener("click", function () {
  const payload = buildV2Export(state, posProcess, posFile);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mini-pipeline.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus("Saved mini-pipeline.json (local download only).");
});

$("btn-cleanup").addEventListener("click", runCleanup);

$("graph-svg").addEventListener("wheel", onGraphWheel, { passive: false });

$("graph-svg").addEventListener("click", function () {
  state.selection = null;
  syncUi();
});

window.addEventListener("keydown", function (ev) {
  if (ev.key !== "Delete" && ev.key !== "Backspace") return;
  if (isTypingInField(ev.target)) return;
  if (state.selection) {
    ev.preventDefault();
    deleteSelection();
  }
});

$("file-json").addEventListener("change", function () {
  const file = $("file-json").files && $("file-json").files[0];
  $("file-json").value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    let data;
    try {
      data = JSON.parse(String(reader.result));
    } catch (e) {
      setStatus("Invalid JSON: " + e.message, true);
      return;
    }
    const backup = cloneDiagramState();
    const err = loadGraphFromData(data);
    if (err) {
      setStatus("Cannot load: " + err, true);
      restoreDiagramState(backup);
      return;
    }
    setStatus("Loaded " + file.name + ".");
    syncUi();
  };
  reader.onerror = function () {
    setStatus("Could not read file.", true);
  };
  reader.readAsText(file);
});

syncUi();
