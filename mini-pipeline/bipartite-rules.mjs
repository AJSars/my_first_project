/**
 * Pure rules for bipartite Process/File validation and structural comparison.
 * Used by `npm test` and by `app.js` (ES module).
 */

function isCoordKeyPresent(v) {
  return v !== undefined;
}

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

/**
 * True if every Process and File in `data` has finite `x` and `y` (after validation).
 * @param {object} data raw v2 payload (same shape as validate input)
 */
export function payloadHasFullLayout(data) {
  if (!data.processes || !data.files) return false;
  for (let i = 0; i < data.processes.length; i++) {
    const p = data.processes[i];
    if (!isFiniteNumber(p.x) || !isFiniteNumber(p.y)) return false;
  }
  for (let j = 0; j < data.files.length; j++) {
    const f = data.files[j];
    if (!isFiniteNumber(f.x) || !isFiniteNumber(f.y)) return false;
  }
  return data.processes.length + data.files.length > 0;
}

/**
 * @param {object} data validated v2 payload with full layout on every entity
 * @returns {{ posProcess: Record<string, {x:number,y:number}>, posFile: Record<string, {x:number,y:number}> }}
 */
export function layoutCoordsFromPayload(data) {
  const posProcess = {};
  const posFile = {};
  data.processes.forEach(function (p) {
    posProcess[p.id] = { x: p.x, y: p.y };
  });
  data.files.forEach(function (f) {
    posFile[f.id] = { x: f.x, y: f.y };
  });
  return { posProcess, posFile };
}

/** @returns {string | null} */
export function validatePartitionDisjoint(diagram) {
  const pset = new Set(diagram.processes.map(function (x) { return x.id; }));
  for (let i = 0; i < diagram.files.length; i++) {
    if (pset.has(diagram.files[i].id))
      return "Each id MUST be either a Process or a File, not both (globally unique partition).";
  }
  return null;
}

/** @returns {{ processes: object[], files: object[], links: object[] }} */
export function normalizeV2Diagram(data) {
  const processes = data.processes.map(function (p) {
    return {
      id: p.id,
      label: p.label,
      detail: p.detail != null ? p.detail : "",
    };
  });
  const files = data.files.map(function (f) {
    return {
      id: f.id,
      label: f.label,
      detail: f.detail != null ? f.detail : "",
    };
  });
  const links = data.links.map(function (l, idx) {
    return {
      id: l.id != null ? l.id : "link-" + idx + "-" + l.processId + "-" + l.fileId,
      processId: l.processId,
      fileId: l.fileId,
    };
  });
  return { processes: processes, files: files, links: links };
}

/**
 * Validate raw JSON shape and logical rules.
 * @returns {string | null} error or null
 */
export function validateV2Payload(data) {
  if (!data || typeof data !== "object") return "Data must be a JSON object.";
  if (data.version !== 2) {
    if (data.version === 1 || Array.isArray(data.nodes))
      return "Bipartite v2 required (processes, files, links). v1 (nodes/edges) is not supported.";
    return 'Expected "version": 2.';
  }
  if (!Array.isArray(data.processes)) return 'Expected "processes" array.';
  if (!Array.isArray(data.files)) return 'Expected "files" array.';
  if (!Array.isArray(data.links)) return 'Expected "links" array.';
  let anyCoord = false;
  for (let i = 0; i < data.processes.length; i++) {
    const p = data.processes[i];
    if (!p || typeof p.id !== "string" || !p.id) return "Each Process needs a non-empty string id.";
    if (typeof p.label !== "string") return "Each Process needs a string label.";
    if (p.detail != null && typeof p.detail !== "string") return "Process detail must be a string if present.";
    if (isCoordKeyPresent(p.x) !== isCoordKeyPresent(p.y))
      return "Process layout must include both x and y or omit both.";
    if (isCoordKeyPresent(p.x)) anyCoord = true;
  }
  for (let j = 0; j < data.files.length; j++) {
    const f = data.files[j];
    if (!f || typeof f.id !== "string" || !f.id) return "Each File needs a non-empty string id.";
    if (typeof f.label !== "string") return "Each File needs a string label.";
    if (f.detail != null && typeof f.detail !== "string") return "File detail must be a string if present.";
    if (isCoordKeyPresent(f.x) !== isCoordKeyPresent(f.y))
      return "File layout must include both x and y or omit both.";
    if (isCoordKeyPresent(f.x)) anyCoord = true;
  }
  if (anyCoord) {
    for (let pi = 0; pi < data.processes.length; pi++) {
      const p = data.processes[pi];
      if (!isFiniteNumber(p.x) || !isFiniteNumber(p.y))
        return "When any layout is present, every Process must have finite x and y.";
    }
    for (let fj = 0; fj < data.files.length; fj++) {
      const f = data.files[fj];
      if (!isFiniteNumber(f.x) || !isFiniteNumber(f.y))
        return "When any layout is present, every File must have finite x and y.";
    }
  }
  const lid = new Set();
  for (let k = 0; k < data.links.length; k++) {
    const L = data.links[k];
    if (!L || typeof L.processId !== "string" || typeof L.fileId !== "string")
      return "Each link needs processId and fileId strings.";
    if (L.id != null) {
      if (typeof L.id !== "string" || !L.id) return "Link id must be non-empty string if present.";
      if (lid.has(L.id)) return "Duplicate link id: " + L.id;
      lid.add(L.id);
    }
  }
  const diagram = normalizeV2Diagram(data);
  return validatePartitionDisjoint(diagram) || validateAllLinks(diagram);
}

/** @returns {string | null} Error message or null if ok. */
export function validateBipartiteLink(processId, fileId, processIdSet, fileIdSet) {
  if (typeof processId !== "string" || !processId) return "processId MUST be a non-empty string";
  if (typeof fileId !== "string" || !fileId) return "fileId MUST be a non-empty string";
  if (!processIdSet.has(processId)) return "processId MUST name an existing Process";
  if (!fileIdSet.has(fileId)) return "fileId MUST name an existing File";
  if (fileIdSet.has(processId))
    return "Invalid connection: processId MUST NOT name a File (same-partition link)";
  if (processIdSet.has(fileId))
    return "Invalid connection: fileId MUST NOT name a Process (same-partition link)";
  return null;
}

/** Structural identity: processes, files, and links (order-independent). Ignores positions/layout. */
export function graphStructuralKey(diagram) {
  const p = diagram.processes.map(function (x) { return x.id; }).sort().join("\u0001");
  const f = diagram.files.map(function (x) { return x.id; }).sort().join("\u0001");
  const l = diagram.links
    .map(function (x) {
      return x.processId + "\u0002" + x.fileId;
    })
    .sort()
    .join("\u0003");
  return "P:" + p + "|F:" + f + "|L:" + l;
}

export function duplicateLinkPairExists(links) {
  const seen = new Set();
  for (let i = 0; i < links.length; i++) {
    const k = links[i].processId + "\u0002" + links[i].fileId;
    if (seen.has(k)) return true;
    seen.add(k);
  }
  return false;
}

/** Validate all links in a diagram; @returns {string | null} */
export function validateAllLinks(diagram) {
  const pset = new Set(diagram.processes.map(function (x) { return x.id; }));
  const fset = new Set(diagram.files.map(function (x) { return x.id; }));
  if (pset.size !== diagram.processes.length) return "Duplicate Process id";
  if (fset.size !== diagram.files.length) return "Duplicate File id";
  if (duplicateLinkPairExists(diagram.links)) return "Duplicate (processId, fileId) link";
  for (let i = 0; i < diagram.links.length; i++) {
    const msg = validateBipartiteLink(
      diagram.links[i].processId,
      diagram.links[i].fileId,
      pset,
      fset
    );
    if (msg) return msg;
  }
  return null;
}
