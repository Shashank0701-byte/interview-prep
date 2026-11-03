const languages = [
    { id: "javascript", label: "JavaScript", monaco: "javascript", path: "solution.js" },
    { id: "python", label: "Python", monaco: "python", path: "solution.py" },
    { id: "cpp", label: "C++", monaco: "cpp", path: "solution.cpp" },
    { id: "java", label: "Java", monaco: "java", path: "solution.java" },
];

function pack(id, title, difficulty, minutes, summary, brief, signatures, bodies, tests) {
    const statement = [
        brief.story,
        "",
        brief.task,
        "",
        "Input",
        brief.input,
        "",
        "Output",
        brief.output,
        "",
        "Constraints",
        ...brief.constraints.map((line) => `- ${line}`),
        "",
        ...brief.samples.flatMap((sample, index) => [
            `Sample ${index + 1}`,
            "Input",
            sample.input,
            "Output",
            sample.output,
            "Explanation",
            sample.explanation,
            "",
        ]),
        brief.note,
    ].join("\n");

    return {
        id,
        title,
        difficulty,
        minutes,
        summary,
        limits: "1 second · 256 MB",
        brief,
        statement,
        signatures,
        languages,
        files: languages.map((language) => ({
            path: language.path,
            code: bodies[language.id],
        })),
        tests,
    };
}

const tasks = [
    pack(
        "pier-windows",
        "Pier Windows",
        "Medium",
        40,
        "A harbor log of berth requests. Collapse overlapping and touching windows into busy stretches.",
        {
            story: "The night harbor master keeps a paper log of berth requests. Each request is a closed time window: a ship occupies the pier from minute L through minute R, inclusive. Two requests that overlap, or that touch at an endpoint, are one continuous busy stretch. The master wants the shortest list of busy stretches, sorted by the minute they begin.",
            task: "Given n berth windows, merge every pair that overlaps or touches and return the busy stretches in increasing order of start minute.",
            input: "The judge passes one argument, windows: an array of n pairs [L, R]. In the sample format below, the first line is n and each following line is one window.",
            output: "An array of merged pairs [L, R], sorted by L. A window that touches the next one at a single minute is merged. Windows that only share nothing stay separate.",
            constraints: [
                "0 ≤ n ≤ 100000",
                "0 ≤ L ≤ R ≤ 1000000000",
                "Windows are not guaranteed to be sorted",
                "Touching endpoints count as one stretch: [1, 4] and [4, 8] become [1, 8]",
            ],
            samples: [
                {
                    input: "4\n10 14\n2 6\n5 9\n20 22",
                    output: "2 9\n10 14\n20 22",
                    explanation: "Sorted by start, the windows are [2, 6], [5, 9], [10, 14], [20, 22]. [2, 6] and [5, 9] overlap, so they become [2, 9]. [10, 14] starts after 9, and [20, 22] starts after 14, so those two stay separate.",
                },
                {
                    input: "2\n1 4\n4 8",
                    output: "1 8",
                    explanation: "The first window ends at minute 4 and the second starts at minute 4. The pier never goes free, so the stretch is [1, 8].",
                },
            ],
            note: "Use the name mergeWindows in every language. JavaScript exports it with module.exports. Java puts it on class Solution. C++ is a free function. The judge runs whichever language is selected.",
        },
        {
            javascript: "Export mergeWindows(windows) with module.exports = { mergeWindows }. windows is an array of [start, end] pairs. Return the merged pairs.",
            python: "def mergeWindows(windows): windows is a list of [start, end] pairs. Return the merged pairs.",
            cpp: "std::vector<std::vector<int>> mergeWindows(const std::vector<std::vector<int>>& windows). Return the merged pairs.",
            java: "public int[][] mergeWindows(int[][] windows) inside class Solution. Return the merged pairs.",
        },
        {
            javascript: `function mergeWindows(windows) {
  return windows;
}

module.exports = { mergeWindows };
`,
            python: `def mergeWindows(windows):
    return windows
`,
            cpp: `#include <vector>

std::vector<std::vector<int>> mergeWindows(const std::vector<std::vector<int>>& windows) {
    return windows;
}
`,
            java: `class Solution {
    public int[][] mergeWindows(int[][] windows) {
        return windows;
    }
}
`,
        },
        [
            {
                id: "harbor-log",
                name: "the night log collapses one overlap",
                visibility: "public",
                expect: [[2, 9], [10, 14], [20, 22]],
                steps: [{ file: "solution.js", fn: "mergeWindows", args: [[[10, 14], [2, 6], [5, 9], [20, 22]]] }],
            },
            {
                id: "touching",
                name: "windows that touch at one minute merge",
                visibility: "public",
                expect: [[1, 8]],
                steps: [{ file: "solution.js", fn: "mergeWindows", args: [[[1, 4], [4, 8]]] }],
            },
            {
                id: "contained",
                name: "a window inside another stays one stretch",
                visibility: "hidden",
                expect: [[1, 10]],
                steps: [{ file: "solution.js", fn: "mergeWindows", args: [[[1, 10], [2, 3], [4, 6]]] }],
            },
            {
                id: "unsorted",
                name: "the log is not sorted",
                visibility: "hidden",
                expect: [[1, 5], [8, 9]],
                steps: [{ file: "solution.js", fn: "mergeWindows", args: [[[8, 9], [1, 3], [2, 5]]] }],
            },
            {
                id: "empty",
                name: "an empty log",
                visibility: "hidden",
                expect: [],
                steps: [{ file: "solution.js", fn: "mergeWindows", args: [[]] }],
            },
            {
                id: "single",
                name: "one window is unchanged",
                visibility: "hidden",
                expect: [[4, 4]],
                steps: [{ file: "solution.js", fn: "mergeWindows", args: [[[4, 4]]] }],
            },
        ]
    ),
    pack(
        "catalog-drawer",
        "Catalog Drawer",
        "Medium",
        45,
        "A restoration desk that keeps only the most recently handled catalog cards.",
        {
            story: "A restoration desk has a drawer that holds at most C catalog cards. The archivist handles one operation at a time. Filing a card or checking a card counts as handling it, which makes that card the most recently handled. When a new card is filed and the drawer is already full, the card that has gone the longest without being handled is discarded. Checking a missing card reports -1 and does not change the drawer.",
            task: "Replay the operation log against a drawer of capacity C. FILE stores a note on a card id. CHECK reports the note currently stored for that id.",
            input: "The judge calls replay(capacity, operations). Each operation is [\"FILE\", id, note] or [\"CHECK\", id]. In the sample format, the first line is C and Q, then Q operations.",
            output: "An array with one entry per operation. FILE contributes null. CHECK contributes the stored note, or -1 when the card is not in the drawer. Filing an id that is already present replaces its note and counts as a fresh handling. Both FILE and CHECK refresh a card.",
            constraints: [
                "1 ≤ C ≤ 1000",
                "1 ≤ Q ≤ 100000",
                "1 ≤ id, note ≤ 1000000000",
                "A CHECK never inserts a card",
                "When the drawer is full, the least recently handled card is the one discarded",
            ],
            samples: [
                {
                    input: "2 5\nFILE 10 5\nFILE 20 8\nCHECK 10\nFILE 30 1\nCHECK 20",
                    output: "null\nnull\n5\nnull\n-1",
                    explanation: "After the first two filings the drawer holds 10 then 20, with 10 older. CHECK 10 returns 5 and makes 10 the newest, so 20 is now the oldest. FILE 30 must discard 20. CHECK 20 returns -1.",
                },
                {
                    input: "2 5\nFILE 10 5\nFILE 20 8\nFILE 10 9\nFILE 30 1\nCHECK 10",
                    output: "null\nnull\nnull\nnull\n9",
                    explanation: "Filing 10 again replaces note 5 with 9 and makes 10 newer than 20. FILE 30 discards 20, not 10. CHECK 10 returns the updated note 9.",
                },
            ],
            note: "Use the name replay in every language. JavaScript exports it. Java puts it on class Solution. C++ includes judge_api.hpp, which the judge supplies when you run. Operation has type, id, note, and hasNote. JudgeLong.present is false for null. The judge runs whichever language is selected.",
        },
        {
            javascript: "Export replay(capacity, operations). operations are [\"FILE\", id, note] or [\"CHECK\", id]. Return an array: null for FILE, the note or -1 for CHECK. module.exports = { replay }.",
            python: "def replay(capacity, operations): operations are [\"FILE\", id, note] or [\"CHECK\", id]. Return a list with None for FILE and an int or -1 for CHECK.",
            cpp: "Include judge_api.hpp. std::vector<JudgeLong> replay(int capacity, const std::vector<Operation>& operations). Operation.type is FILE or CHECK. JudgeLong.present false means null.",
            java: "public Object[] replay(int capacity, Object[][] operations) inside class Solution. Each row is {\"FILE\", id, note} or {\"CHECK\", id}. Return null for FILE and an Integer for CHECK.",
        },
        {
            javascript: `class Drawer {
  constructor(capacity) {
    this.capacity = capacity;
  }

  check() {
    return -1;
  }

  file() {}
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
            python: `def replay(capacity, operations):
    output = []
    for operation in operations:
        if operation[0] == "CHECK":
            output.append(-1)
        else:
            output.append(None)
    return output
`,
            cpp: `#include "judge_api.hpp"
// Supplied when you run:
// struct Operation { string type; long long id; long long note; bool hasNote; };
// struct JudgeLong { bool present; long long value; }; // present == false is null

std::vector<JudgeLong> replay(int capacity, const std::vector<Operation>& operations) {
    std::vector<JudgeLong> output;
    for (size_t i = 0; i < operations.size(); i++) {
        JudgeLong result;
        result.present = operations[i].type == "CHECK";
        result.value = operations[i].type == "CHECK" ? -1 : 0;
        output.push_back(result);
    }
    return output;
}
`,
            java: `class Solution {
    public Object[] replay(int capacity, Object[][] operations) {
        Object[] output = new Object[operations.length];
        for (int i = 0; i < operations.length; i++) {
            output[i] = "CHECK".equals(operations[i][0]) ? Integer.valueOf(-1) : null;
        }
        return output;
    }
}
`,
        },
        [
            {
                id: "discard-oldest",
                name: "a full drawer discards the card handled least recently",
                visibility: "public",
                expect: [null, null, 5, null, -1],
                steps: [{
                    file: "solution.js",
                    fn: "replay",
                    args: [2, [["FILE", 10, 5], ["FILE", 20, 8], ["CHECK", 10], ["FILE", 30, 1], ["CHECK", 20]]],
                }],
            },
            {
                id: "replace-note",
                name: "filing an existing card replaces the note",
                visibility: "public",
                expect: [null, null, null, null, 9],
                steps: [{
                    file: "solution.js",
                    fn: "replay",
                    args: [2, [["FILE", 10, 5], ["FILE", 20, 8], ["FILE", 10, 9], ["FILE", 30, 1], ["CHECK", 10]]],
                }],
            },
            {
                id: "check-refreshes",
                name: "checking a card saves it from the next discard",
                visibility: "hidden",
                expect: [null, null, 5, null, -1, 5],
                steps: [{
                    file: "solution.js",
                    fn: "replay",
                    args: [2, [["FILE", 10, 5], ["FILE", 20, 8], ["CHECK", 10], ["FILE", 30, 1], ["CHECK", 20], ["CHECK", 10]]],
                }],
            },
            {
                id: "capacity-one",
                name: "capacity one keeps only the latest card",
                visibility: "hidden",
                expect: [null, null, -1, 3],
                steps: [{
                    file: "solution.js",
                    fn: "replay",
                    args: [1, [["FILE", 4, 7], ["FILE", 9, 3], ["CHECK", 4], ["CHECK", 9]]],
                }],
            },
        ]
    ),
    pack(
        "cue-sheet",
        "Cue Sheet",
        "Medium",
        40,
        "Order the cues in a show so every dependency finishes first. A cycle means the show cannot start.",
        {
            story: "A stage manager has n cues, numbered from 0 to n - 1. Some cues are locked until another cue has finished. The dependency list gives pairs [later, earlier]: earlier must be called before later. If the dependencies loop, no legal order exists. Whenever several cues are unlocked, the manager calls the smallest number. That rule makes the order unique when an order exists.",
            task: "Return the full calling order, or an empty array when the dependencies contain a cycle.",
            input: "The judge calls orderCues(n, dependencies). dependencies[i] is [later, earlier]. In the sample format the first line is n and m, then m dependency lines.",
            output: "An array of all n cue numbers in calling order. If any cycle exists, even among a subset of the cues, return [].",
            constraints: [
                "1 ≤ n ≤ 100000",
                "0 ≤ m ≤ 100000",
                "0 ≤ earlier, later < n",
                "earlier and later are different",
                "When several cues are unlocked, the smallest number is called next",
            ],
            samples: [
                {
                    input: "5 4\n1 0\n2 1\n3 0\n4 3",
                    output: "0 1 2 3 4",
                    explanation: "Cue 0 is the only one with nothing before it. Calling 0 unlocks 1 and 3. The smaller is 1, which unlocks 2. The unlocked set is then 2 and 3, so 2 is next, then 3, which unlocks 4.",
                },
                {
                    input: "2 2\n0 1\n1 0",
                    output: "",
                    explanation: "Cue 0 waits for 1, and cue 1 waits for 0. Nothing can be called, so the result is empty.",
                },
            ],
            note: "Use the name orderCues in every language. JavaScript exports it. Java puts it on class Solution. C++ is a free function. The judge runs whichever language is selected.",
        },
        {
            javascript: "Export orderCues(n, dependencies) with module.exports = { orderCues }. Each dependency is [later, earlier]. Return the order, or [] if there is a cycle. Break ties by the smaller cue number.",
            python: "def orderCues(n, dependencies): each dependency is [later, earlier]. Return the order, or [] on a cycle. Break ties by the smaller cue number.",
            cpp: "std::vector<int> orderCues(int n, const std::vector<std::vector<int>>& dependencies). Return the order or an empty vector. Break ties by the smaller cue number.",
            java: "public int[] orderCues(int n, int[][] dependencies) inside class Solution. Return the order, or an empty array on a cycle.",
        },
        {
            javascript: `function orderCues() {
  return [];
}

module.exports = { orderCues };
`,
            python: `def orderCues(n, dependencies):
    return []
`,
            cpp: `#include <vector>

std::vector<int> orderCues(int n, const std::vector<std::vector<int>>& dependencies) {
    return {};
}
`,
            java: `class Solution {
    public int[] orderCues(int n, int[][] dependencies) {
        return new int[0];
    }
}
`,
        },
        [
            {
                id: "chain",
                name: "the sample show has one legal order",
                visibility: "public",
                expect: [0, 1, 2, 3, 4],
                steps: [{ file: "solution.js", fn: "orderCues", args: [5, [[1, 0], [2, 1], [3, 0], [4, 3]]] }],
            },
            {
                id: "cycle",
                name: "two cues waiting on each other",
                visibility: "public",
                expect: [],
                steps: [{ file: "solution.js", fn: "orderCues", args: [2, [[0, 1], [1, 0]]] }],
            },
            {
                id: "no-deps",
                name: "cues with no dependencies stay in number order",
                visibility: "hidden",
                expect: [0, 1, 2],
                steps: [{ file: "solution.js", fn: "orderCues", args: [3, []] }],
            },
            {
                id: "smaller-first",
                name: "the smaller unlocked cue is called first",
                visibility: "hidden",
                expect: [0, 1, 2, 3],
                steps: [{ file: "solution.js", fn: "orderCues", args: [4, [[2, 0], [3, 0], [1, 0]]] }],
            },
            {
                id: "partial-cycle",
                name: "a cycle in part of the sheet blocks the show",
                visibility: "hidden",
                expect: [],
                steps: [{ file: "solution.js", fn: "orderCues", args: [4, [[1, 0], [0, 1]]] }],
            },
        ]
    ),
    pack(
        "lock-basins",
        "Lock Basins",
        "Hard",
        45,
        "After rain, how much water sits in the basins between canal locks.",
        {
            story: "A canal is a row of stone locks. heights[i] is the height of the lock at position i, and every lock is one unit wide. Rain falls until the water is level with the lower of the tallest locks on the left and on the right. Water that can run off either open end does not stay. A lock holds water only above its own stone and below that waterline.",
            task: "Return the total units of water held by the canal.",
            input: "The judge calls holdWater(heights). In the sample format the first line is n and the second line is the n heights.",
            output: "One integer, the total water. Positions at either end hold none, because there is no wall beyond them.",
            constraints: [
                "0 ≤ n ≤ 100000",
                "0 ≤ heights[i] ≤ 100000",
                "Water at index i is max(0, min(tallest strictly to the left, tallest strictly to the right) - heights[i])",
                "An empty canal and a strictly rising or falling row hold 0",
            ],
            samples: [
                {
                    input: "5\n3 0 1 0 2",
                    output: "5",
                    explanation: "The row is 3, 0, 1, 0, 2. Index 1 sits under a line of height 2, so it holds 2. Index 2 holds 1. Index 3 holds 2. The ends hold 0. Total 5.\n\n# # . . .\n# # . . #\n# w w w #",
                },
                {
                    input: "3\n1 0 1",
                    output: "1",
                    explanation: "The middle lock is empty stone between two locks of height 1, so exactly 1 unit stays.",
                },
            ],
            note: "Use the name holdWater in every language. JavaScript exports it. Java puts it on class Solution and returns a long. C++ is a free function. The judge runs whichever language is selected.",
        },
        {
            javascript: "Export holdWater(heights) with module.exports = { holdWater }. heights is an array of non-negative integers. Return the total water as a number.",
            python: "def holdWater(heights): return the total water as an int.",
            cpp: "long long holdWater(const std::vector<int>& heights). Return the total water.",
            java: "public long holdWater(int[] heights) inside class Solution. Return the total water.",
        },
        {
            javascript: `function holdWater() {
  return 0;
}

module.exports = { holdWater };
`,
            python: `def holdWater(heights):
    return 0
`,
            cpp: `#include <vector>

long long holdWater(const std::vector<int>& heights) {
    return 0;
}
`,
            java: `class Solution {
    public long holdWater(int[] heights) {
        return 0;
    }
}
`,
        },
        [
            {
                id: "canal",
                name: "the sample canal holds 5",
                visibility: "public",
                expect: 5,
                steps: [{ file: "solution.js", fn: "holdWater", args: [[3, 0, 1, 0, 2]] }],
            },
            {
                id: "notch",
                name: "a single notch holds 1",
                visibility: "public",
                expect: 1,
                steps: [{ file: "solution.js", fn: "holdWater", args: [[1, 0, 1]] }],
            },
            {
                id: "slope",
                name: "a rising row holds nothing",
                visibility: "hidden",
                expect: 0,
                steps: [{ file: "solution.js", fn: "holdWater", args: [[1, 2, 3]] }],
            },
            {
                id: "bowl",
                name: "a bowl of width one and depth two",
                visibility: "hidden",
                expect: 2,
                steps: [{ file: "solution.js", fn: "holdWater", args: [[2, 0, 2]] }],
            },
            {
                id: "wide",
                name: "two low locks between equal walls",
                visibility: "hidden",
                expect: 6,
                steps: [{ file: "solution.js", fn: "holdWater", args: [[4, 1, 1, 4]] }],
            },
            {
                id: "empty",
                name: "no locks",
                visibility: "hidden",
                expect: 0,
                steps: [{ file: "solution.js", fn: "holdWater", args: [[]] }],
            },
        ]
    ),
];

function listTasks() {
    return tasks.map(({ id, title, difficulty, minutes, summary }) => ({
        id,
        title,
        difficulty,
        minutes,
        summary,
    }));
}

function getTask(id) {
    return tasks.find((task) => task.id === id) || null;
}

module.exports = { tasks, listTasks, getTask };
