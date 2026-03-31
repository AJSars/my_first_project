/**
 * Bipartite layout helpers (browser global; Node tests via eval).
 * Cleanup (`rebuildBipartiteCleanup`) assigns left-to-right **layers** from link
 * connectivity (BFS from min Process id per component), alternates Process/File
 * by layer, and refines vertical order with a short barycenter pass. Input
 * **processes** / **files** arrays are never mutated.
 */
(function (global) {
  var PAD = 48;
  var ROW_H = 100;
  var NODE_R = 28;
  var FILE_W = 120;
  var FILE_H = 48;
  var GAP_X = 300;

  function sortStr(arr) {
    return arr.slice().sort();
  }

  function neighborsOf(id, pset, adjP, adjF) {
    if (pset[id]) return adjP[id] || [];
    return adjF[id] || [];
  }

  /**
   * Layered cleanup: columns follow connectivity (BFS depth from seed Process);
   * vertical order refined to reduce crossings.
   * Does not mutate **processes** / **files** array contents.
   * @param {{id:string}[]} processes
   * @param {{id:string}[]} files
   * @param {{processId:string,fileId:string}[]} links
   */
  function rebuildBipartiteCleanup(processes, files, links) {
    var pPos = {};
    var fPos = {};
    var linksArr = links || [];

    var pset = {};
    processes.forEach(function (p) {
      pset[p.id] = true;
    });
    var fset = {};
    files.forEach(function (f) {
      fset[f.id] = true;
    });

    var adjP = {};
    var adjF = {};
    processes.forEach(function (p) {
      adjP[p.id] = [];
    });
    files.forEach(function (f) {
      adjF[f.id] = [];
    });
    for (var li = 0; li < linksArr.length; li++) {
      var L = linksArr[li];
      if (adjP[L.processId]) adjP[L.processId].push(L.fileId);
      if (adjF[L.fileId]) adjF[L.fileId].push(L.processId);
    }

    var allIds = processes.map(function (p) {
      return p.id;
    }).concat(
      files.map(function (f) {
        return f.id;
      })
    );

    var visited = {};
    var components = [];

    function dfsComp(start, acc) {
      var stack = [start];
      visited[start] = true;
      while (stack.length) {
        var u = stack.pop();
        acc.push(u);
        var nb = neighborsOf(u, pset, adjP, adjF);
        for (var i = 0; i < nb.length; i++) {
          var v = nb[i];
          if (!visited[v]) {
            visited[v] = true;
            stack.push(v);
          }
        }
      }
    }

    for (var ai = 0; ai < allIds.length; ai++) {
      var sid = allIds[ai];
      if (!visited[sid]) {
        var comp = [];
        dfsComp(sid, comp);
        components.push(comp);
      }
    }

    var compSet = function (comp) {
      var s = {};
      for (var i = 0; i < comp.length; i++) s[comp[i]] = true;
      return s;
    };

    var edgeInComp = function (compS) {
      for (var i = 0; i < linksArr.length; i++) {
        var L = linksArr[i];
        if (compS[L.processId] && compS[L.fileId]) return true;
      }
      return false;
    };

    var yOffset = 0;

    for (var ci = 0; ci < components.length; ci++) {
      var comp = components[ci];
      var cS = compSet(comp);
      var hasEdge = edgeInComp(cS);

      var compPs = sortStr(comp.filter(function (id) {
        return pset[id];
      }));
      var compFs = sortStr(comp.filter(function (id) {
        return fset[id];
      }));

      if (!hasEdge) {
        for (var pi = 0; pi < compPs.length; pi++) {
          pPos[compPs[pi]] = { x: PAD, y: PAD + yOffset + pi * ROW_H };
        }
        for (var fi = 0; fi < compFs.length; fi++) {
          fPos[compFs[fi]] = { x: PAD + GAP_X, y: PAD + yOffset + fi * ROW_H };
        }
        yOffset += Math.max(compPs.length, compFs.length) * ROW_H + ROW_H;
        continue;
      }

      var seed;
      if (compPs.length) {
        seed = compPs[0];
      } else {
        seed = compFs[0];
      }

      var dist = {};
      dist[seed] = 0;
      var q = [seed];
      for (var qi = 0; qi < q.length; qi++) {
        var u = q[qi];
        var nb2 = neighborsOf(u, pset, adjP, adjF);
        for (var ni = 0; ni < nb2.length; ni++) {
          var v = nb2[ni];
          if (dist[v] === undefined) {
            dist[v] = dist[u] + 1;
            q.push(v);
          }
        }
      }

      var minD = Infinity;
      for (var k0 in dist) {
        if (dist[k0] < minD) minD = dist[k0];
      }
      comp.forEach(function (id) {
        if (dist[id] === undefined) {
          dist[id] = minD + 999;
        }
      });
      minD = Infinity;
      for (var k2 in dist) {
        if (dist[k2] < minD) minD = dist[k2];
      }

      var layerOf = {};
      for (var k3 in dist) {
        layerOf[k3] = dist[k3] - minD;
      }

      var maxLayer = 0;
      comp.forEach(function (id) {
        if (layerOf[id] > maxLayer) maxLayer = layerOf[id];
      });

      var layers = [];
      for (var L = 0; L <= maxLayer; L++) layers[L] = [];

      comp.forEach(function (id) {
        layers[layerOf[id]].push(id);
      });
      for (var L2 = 0; L2 <= maxLayer; L2++) {
        layers[L2] = sortStr(layers[L2]);
      }

      function medianIdx(indices) {
        var s = indices.filter(function (ix) {
          return ix >= 0;
        });
        if (!s.length) return 0;
        s.sort(function (a, b) {
          return a - b;
        });
        return s[Math.floor(s.length / 2)];
      }

      var iter;
      for (iter = 0; iter < 2; iter++) {
        for (var L3 = 1; L3 <= maxLayer; L3++) {
          layers[L3] = layers[L3].slice().sort(function (a, b) {
            var na = neighborsOf(a, pset, adjP, adjF);
            var nb = neighborsOf(b, pset, adjP, adjF);
            var ma = medianIdx(
              na.map(function (x) {
                return layers[L3 - 1].indexOf(x);
              })
            );
            var mb = medianIdx(
              nb.map(function (x) {
                return layers[L3 - 1].indexOf(x);
              })
            );
            if (ma !== mb) return ma - mb;
            return a < b ? -1 : a > b ? 1 : 0;
          });
        }
        for (var L4 = maxLayer - 1; L4 >= 0; L4--) {
          layers[L4] = layers[L4].slice().sort(function (a, b) {
            var na = neighborsOf(a, pset, adjP, adjF);
            var nb = neighborsOf(b, pset, adjP, adjF);
            var ma = medianIdx(
              na.map(function (x) {
                return layers[L4 + 1].indexOf(x);
              })
            );
            var mb = medianIdx(
              nb.map(function (x) {
                return layers[L4 + 1].indexOf(x);
              })
            );
            if (ma !== mb) return ma - mb;
            return a < b ? -1 : a > b ? 1 : 0;
          });
        }
      }

      var maxRows = 0;
      for (var L5 = 0; L5 <= maxLayer; L5++) {
        if (layers[L5].length > maxRows) maxRows = layers[L5].length;
      }

      for (var L6 = 0; L6 <= maxLayer; L6++) {
        var row = layers[L6];
        for (var r = 0; r < row.length; r++) {
          var id2 = row[r];
          var x = PAD + L6 * GAP_X;
          var y = PAD + yOffset + r * ROW_H;
          if (pset[id2]) {
            pPos[id2] = { x: x, y: y };
          } else {
            fPos[id2] = { x: x, y: y };
          }
        }
      }

      yOffset += maxRows * ROW_H + ROW_H;
    }

    return { processes: pPos, files: fPos };
  }

  function computeBoundsBipartite(procPos, filePos, processIds, fileIds) {
    var maxX = PAD;
    var maxY = PAD;
    processIds.forEach(function (id) {
      var p = procPos[id];
      if (p) {
        maxX = Math.max(maxX, p.x + 2 * NODE_R);
        maxY = Math.max(maxY, p.y + 2 * NODE_R);
      }
    });
    fileIds.forEach(function (id) {
      var p = filePos[id];
      if (p) {
        maxX = Math.max(maxX, p.x + FILE_W);
        maxY = Math.max(maxY, p.y + FILE_H);
      }
    });
    return {
      w: Math.max(480, maxX + PAD),
      h: Math.max(320, maxY + PAD),
    };
  }

  function placeNewProcess(procPos, processes, newId) {
    var bottom = PAD;
    processes.forEach(function (n) {
      if (n.id === newId) return;
      var p = procPos[n.id];
      if (p) bottom = Math.max(bottom, p.y + 2 * NODE_R + 24);
    });
    return { x: PAD, y: bottom };
  }

  function placeNewFile(filePos, files, newId) {
    var bottom = PAD;
    files.forEach(function (n) {
      if (n.id === newId) return;
      var p = filePos[n.id];
      if (p) bottom = Math.max(bottom, p.y + FILE_H + 24);
    });
    return { x: PAD + GAP_X, y: bottom };
  }

  global.MPDMGeometry = {
    rebuildBipartiteCleanup: rebuildBipartiteCleanup,
    computeBoundsBipartite: computeBoundsBipartite,
    placeNewProcess: placeNewProcess,
    placeNewFile: placeNewFile,
    PAD: PAD,
    ROW_H: ROW_H,
    NODE_R: NODE_R,
    FILE_W: FILE_W,
    FILE_H: FILE_H,
    GAP_X: GAP_X,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
