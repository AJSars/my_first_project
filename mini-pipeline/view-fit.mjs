/**
 * Pure viewport fitting: bounding box of Processes, Files, and link segments,
 * plus uniform margin. Used by the app and `npm test`.
 */

function lineEndpoints(px, py, fx, fy, NODE_R, FILE_W, FILE_H) {
  const pcx = px + NODE_R;
  const pcy = py + NODE_R;
  const fcx = fx + FILE_W / 2;
  const fcy = fy + FILE_H / 2;
  let dx = fcx - pcx;
  let dy = fcy - pcy;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  const x1 = pcx + ux * NODE_R;
  const y1 = pcy + uy * NODE_R;
  const dx2 = pcx - fcx;
  const dy2 = pcy - fcy;
  const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
  const vx = dx2 / d2;
  const vy = dy2 / d2;
  const halfW = FILE_W / 2;
  const halfH = FILE_H / 2;
  const hx = Math.abs(vx) < 1e-9 ? Infinity : halfW / Math.abs(vx);
  const hy = Math.abs(vy) < 1e-9 ? Infinity : halfH / Math.abs(vy);
  const tmax = Math.min(hx, hy);
  const x2 = fcx + vx * tmax;
  const y2 = fcy + vy * tmax;
  return { x1: x1, y1: y1, x2: x2, y2: y2 };
}

function expandPoint(bb, x, y) {
  bb.minX = Math.min(bb.minX, x);
  bb.minY = Math.min(bb.minY, y);
  bb.maxX = Math.max(bb.maxX, x);
  bb.maxY = Math.max(bb.maxY, y);
}

function expandRect(bb, x0, y0, x1, y1) {
  expandPoint(bb, x0, y0);
  expandPoint(bb, x1, y1);
}

/**
 * @param {object} opts
 * @param {{id:string}[]} opts.processes
 * @param {{id:string}[]} opts.files
 * @param {{processId:string,fileId:string}[]} opts.links
 * @param {Record<string,{x:number,y:number}>} opts.posProcess
 * @param {Record<string,{x:number,y:number}>} opts.posFile
 * @param {number} opts.nodeR
 * @param {number} opts.fileW
 * @param {number} opts.fileH
 * @param {number} opts.margin uniform padding on all sides (user units)
 * @param {number} opts.strokePad extra pad for link stroke visibility
 * @param {number} opts.emptyWidth
 * @param {number} opts.emptyHeight
 * @param {number} opts.minInnerWidth minimum viewBox width when content is tiny
 * @param {number} opts.minInnerHeight minimum viewBox height when content is tiny
 * @returns {{x:number,y:number,w:number,h:number}}
 */
export function computeViewBoxFit(opts) {
  const processes = opts.processes || [];
  const files = opts.files || [];
  const links = opts.links || [];
  const posProcess = opts.posProcess || {};
  const posFile = opts.posFile || {};
  const NODE_R = opts.nodeR;
  const FILE_W = opts.fileW;
  const FILE_H = opts.fileH;
  const margin = opts.margin;
  const strokePad = opts.strokePad != null ? opts.strokePad : 3;
  const emptyW = opts.emptyWidth != null ? opts.emptyWidth : 400;
  const emptyH = opts.emptyHeight != null ? opts.emptyHeight : 300;
  const minInnerW = opts.minInnerWidth != null ? opts.minInnerWidth : 120;
  const minInnerH = opts.minInnerHeight != null ? opts.minInnerHeight : 80;

  if (processes.length === 0 && files.length === 0) {
    return { x: 0, y: 0, w: emptyW, h: emptyH };
  }

  const bb = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];
    const pos = posProcess[p.id];
    if (!pos) continue;
    expandRect(bb, pos.x, pos.y, pos.x + 2 * NODE_R, pos.y + 2 * NODE_R);
  }
  for (let j = 0; j < files.length; j++) {
    const f = files[j];
    const pos = posFile[f.id];
    if (!pos) continue;
    expandRect(bb, pos.x, pos.y, pos.x + FILE_W, pos.y + FILE_H);
  }
  for (let k = 0; k < links.length; k++) {
    const L = links[k];
    const pp = posProcess[L.processId];
    const fp = posFile[L.fileId];
    if (!pp || !fp) continue;
    const seg = lineEndpoints(pp.x, pp.y, fp.x, fp.y, NODE_R, FILE_W, FILE_H);
    expandPoint(bb, seg.x1 - strokePad, seg.y1 - strokePad);
    expandPoint(bb, seg.x1 + strokePad, seg.y1 + strokePad);
    expandPoint(bb, seg.x2 - strokePad, seg.y2 - strokePad);
    expandPoint(bb, seg.x2 + strokePad, seg.y2 + strokePad);
  }

  if (!Number.isFinite(bb.minX) || !Number.isFinite(bb.maxX)) {
    return { x: 0, y: 0, w: emptyW, h: emptyH };
  }

  const spanW = Math.max(bb.maxX - bb.minX, minInnerW);
  const spanH = Math.max(bb.maxY - bb.minY, minInnerH);
  const cx = (bb.minX + bb.maxX) / 2;
  const cy = (bb.minY + bb.maxY) / 2;
  return {
    x: cx - spanW / 2 - margin,
    y: cy - spanH / 2 - margin,
    w: spanW + 2 * margin,
    h: spanH + 2 * margin,
  };
}

export { lineEndpoints as lineEndpointsForFit };
