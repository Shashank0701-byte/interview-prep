module.exports = {
    "pier-windows": {
        "solution.js": `function mergeWindows(windows) {
  if (!windows.length) return [];
  const sorted = windows.map((window) => window.slice()).sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];
  for (let index = 1; index < sorted.length; index += 1) {
    const last = merged[merged.length - 1];
    const current = sorted[index];
    if (current[0] <= last[1]) last[1] = Math.max(last[1], current[1]);
    else merged.push(current);
  }
  return merged;
}

module.exports = { mergeWindows };
`,
    },
    "catalog-drawer": {
        "solution.js": `class Drawer {
  constructor(capacity) {
    this.capacity = capacity;
    this.cards = new Map();
  }

  check(id) {
    if (!this.cards.has(id)) return -1;
    const note = this.cards.get(id);
    this.cards.delete(id);
    this.cards.set(id, note);
    return note;
  }

  file(id, note) {
    if (this.cards.has(id)) this.cards.delete(id);
    this.cards.set(id, note);
    if (this.cards.size > this.capacity) {
      const oldest = this.cards.keys().next().value;
      this.cards.delete(oldest);
    }
  }
}

function replay(capacity, operations) {
  const drawer = new Drawer(capacity);
  const output = [];
  for (const operation of operations) {
    if (operation[0] === "CHECK") output.push(drawer.check(operation[1]));
    else {
      drawer.file(operation[1], operation[2]);
      output.push(null);
    }
  }
  return output;
}

module.exports = { replay, Drawer };
`,
    },
    "cue-sheet": {
        "solution.js": `function orderCues(n, dependencies) {
  const nextCues = Array.from({ length: n }, () => []);
  const indegree = Array(n).fill(0);
  for (const pair of dependencies) {
    nextCues[pair[1]].push(pair[0]);
    indegree[pair[0]] += 1;
  }
  const ready = [];
  for (let cue = 0; cue < n; cue += 1) {
    if (indegree[cue] === 0) ready.push(cue);
  }
  const order = [];
  while (ready.length) {
    ready.sort((a, b) => a - b);
    const cue = ready.shift();
    order.push(cue);
    for (const next of nextCues[cue]) {
      indegree[next] -= 1;
      if (indegree[next] === 0) ready.push(next);
    }
  }
  return order.length === n ? order : [];
}

module.exports = { orderCues };
`,
    },
    "lock-basins": {
        "solution.js": `function holdWater(heights) {
  let left = 0;
  let right = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (heights[left] <= heights[right]) {
      leftMax = Math.max(leftMax, heights[left]);
      water += leftMax - heights[left];
      left += 1;
    } else {
      rightMax = Math.max(rightMax, heights[right]);
      water += rightMax - heights[right];
      right -= 1;
    }
  }
  return water;
}

module.exports = { holdWater };
`,
    },
};
