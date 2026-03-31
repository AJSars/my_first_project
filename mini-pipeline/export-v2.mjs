/**
 * Pure v2 JSON export shape for save/download and tests.
 * @param {{ processes: object[], files: object[], links: object[] }} diagram
 * @param {Record<string, {x:number,y:number}>} posProcess
 * @param {Record<string, {x:number,y:number}>} posFile
 */
export function buildV2Export(diagram, posProcess, posFile) {
  const pp = posProcess || {};
  const fp = posFile || {};
  return {
    version: 2,
    processes: diagram.processes.map(function (p) {
      const pos = pp[p.id] || { x: 0, y: 0 };
      return {
        id: p.id,
        label: p.label,
        detail: p.detail != null ? p.detail : "",
        x: pos.x,
        y: pos.y,
      };
    }),
    files: diagram.files.map(function (f) {
      const pos = fp[f.id] || { x: 0, y: 0 };
      return {
        id: f.id,
        label: f.label,
        detail: f.detail != null ? f.detail : "",
        x: pos.x,
        y: pos.y,
      };
    }),
    links: diagram.links.map(function (l) {
      return {
        id: l.id,
        processId: l.processId,
        fileId: l.fileId,
      };
    }),
  };
}
