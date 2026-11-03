module.exports = {
    "pier-windows": {
        python: `def mergeWindows(windows):
    if not windows:
        return []
    ordered = sorted((list(window) for window in windows), key=lambda window: window[0])
    merged = [ordered[0]]
    for current in ordered[1:]:
        last = merged[-1]
        if current[0] <= last[1]:
            last[1] = max(last[1], current[1])
        else:
            merged.append(current)
    return merged
`,
        cpp: `#include <algorithm>
#include <vector>

std::vector<std::vector<int>> mergeWindows(const std::vector<std::vector<int>>& windows) {
    if (windows.empty()) return {};
    std::vector<std::vector<int>> ordered = windows;
    std::sort(ordered.begin(), ordered.end());
    std::vector<std::vector<int>> merged;
    merged.push_back(ordered[0]);
    for (size_t i = 1; i < ordered.size(); i++) {
        std::vector<int>& last = merged.back();
        const std::vector<int>& current = ordered[i];
        if (current[0] <= last[1]) {
            if (current[1] > last[1]) last[1] = current[1];
        } else {
            merged.push_back(current);
        }
    }
    return merged;
}
`,
        java: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

class Solution {
    public int[][] mergeWindows(int[][] windows) {
        if (windows.length == 0) return new int[0][];
        int[][] ordered = Arrays.copyOf(windows, windows.length);
        Arrays.sort(ordered, Comparator.comparingInt(window -> window[0]));
        ArrayList<int[]> merged = new ArrayList<int[]>();
        merged.add(new int[]{ordered[0][0], ordered[0][1]});
        for (int i = 1; i < ordered.length; i++) {
            int[] last = merged.get(merged.size() - 1);
            if (ordered[i][0] <= last[1]) last[1] = Math.max(last[1], ordered[i][1]);
            else merged.add(new int[]{ordered[i][0], ordered[i][1]});
        }
        return merged.toArray(new int[merged.size()][]);
    }
}
`,
    },
    "catalog-drawer": {
        python: `def replay(capacity, operations):
    cards = {}
    output = []
    for operation in operations:
        if operation[0] == "CHECK":
            card_id = operation[1]
            if card_id not in cards:
                output.append(-1)
            else:
                note = cards.pop(card_id)
                cards[card_id] = note
                output.append(note)
        else:
            card_id = operation[1]
            note = operation[2]
            if card_id in cards:
                del cards[card_id]
            cards[card_id] = note
            if len(cards) > capacity:
                oldest = next(iter(cards))
                del cards[oldest]
            output.append(None)
    return output
`,
        cpp: `#include "judge_api.hpp"
#include <iterator>
#include <list>
#include <unordered_map>
#include <utility>

std::vector<JudgeLong> replay(int capacity, const std::vector<Operation>& operations) {
    std::list<std::pair<long long, long long>> order;
    std::unordered_map<long long, std::list<std::pair<long long, long long>>::iterator> index;
    std::vector<JudgeLong> output;
    for (size_t i = 0; i < operations.size(); i++) {
        const Operation& operation = operations[i];
        if (operation.type == "CHECK") {
            std::unordered_map<long long, std::list<std::pair<long long, long long>>::iterator>::iterator found = index.find(operation.id);
            JudgeLong result;
            result.value = -1;
            if (found == index.end()) {
                result.present = true;
            } else {
                order.splice(order.end(), order, found->second);
                result.present = true;
                result.value = found->second->second;
            }
            output.push_back(result);
        } else {
            std::unordered_map<long long, std::list<std::pair<long long, long long>>::iterator>::iterator found = index.find(operation.id);
            if (found != index.end()) {
                order.erase(found->second);
                index.erase(found);
            }
            order.push_back(std::make_pair(operation.id, operation.note));
            index[operation.id] = std::prev(order.end());
            if ((int)order.size() > capacity) {
                index.erase(order.front().first);
                order.pop_front();
            }
            JudgeLong filed;
            filed.present = false;
            filed.value = 0;
            output.push_back(filed);
        }
    }
    return output;
}
`,
        java: `import java.util.LinkedHashMap;

class Solution {
    public Object[] replay(int capacity, Object[][] operations) {
        LinkedHashMap<Integer, Integer> cards = new LinkedHashMap<Integer, Integer>();
        Object[] output = new Object[operations.length];
        for (int i = 0; i < operations.length; i++) {
            int id = ((Number) operations[i][1]).intValue();
            if ("CHECK".equals(operations[i][0])) {
                if (!cards.containsKey(id)) output[i] = Integer.valueOf(-1);
                else {
                    Integer note = cards.remove(id);
                    cards.put(id, note);
                    output[i] = note;
                }
            } else {
                int note = ((Number) operations[i][2]).intValue();
                cards.remove(id);
                cards.put(id, Integer.valueOf(note));
                if (cards.size() > capacity) {
                    Integer oldest = cards.keySet().iterator().next();
                    cards.remove(oldest);
                }
                output[i] = null;
            }
        }
        return output;
    }
}
`,
    },
    "cue-sheet": {
        python: `def orderCues(n, dependencies):
    next_cues = [[] for _ in range(n)]
    indegree = [0] * n
    for later, earlier in dependencies:
        next_cues[earlier].append(later)
        indegree[later] += 1
    ready = [cue for cue in range(n) if indegree[cue] == 0]
    order = []
    while ready:
        ready.sort()
        cue = ready.pop(0)
        order.append(cue)
        for nxt in next_cues[cue]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                ready.append(nxt)
    return order if len(order) == n else []
`,
        cpp: `#include <algorithm>
#include <vector>

std::vector<int> orderCues(int n, const std::vector<std::vector<int>>& dependencies) {
    std::vector<std::vector<int>> nextCues(n);
    std::vector<int> indegree(n, 0);
    for (size_t i = 0; i < dependencies.size(); i++) {
        int later = dependencies[i][0];
        int earlier = dependencies[i][1];
        nextCues[earlier].push_back(later);
        indegree[later] += 1;
    }
    std::vector<int> ready;
    for (int cue = 0; cue < n; cue++) {
        if (indegree[cue] == 0) ready.push_back(cue);
    }
    std::vector<int> order;
    while (!ready.empty()) {
        std::sort(ready.begin(), ready.end());
        int cue = ready.front();
        ready.erase(ready.begin());
        order.push_back(cue);
        for (size_t i = 0; i < nextCues[cue].size(); i++) {
            int nxt = nextCues[cue][i];
            indegree[nxt] -= 1;
            if (indegree[nxt] == 0) ready.push_back(nxt);
        }
    }
    if ((int)order.size() != n) return {};
    return order;
}
`,
        java: `import java.util.ArrayList;
import java.util.Collections;

class Solution {
    public int[] orderCues(int n, int[][] dependencies) {
        ArrayList<Integer>[] nextCues = new ArrayList[n];
        int[] indegree = new int[n];
        for (int i = 0; i < n; i++) nextCues[i] = new ArrayList<Integer>();
        for (int[] pair : dependencies) {
            nextCues[pair[1]].add(pair[0]);
            indegree[pair[0]] += 1;
        }
        ArrayList<Integer> ready = new ArrayList<Integer>();
        for (int cue = 0; cue < n; cue++) if (indegree[cue] == 0) ready.add(cue);
        int[] order = new int[n];
        int written = 0;
        while (!ready.isEmpty()) {
            Collections.sort(ready);
            int cue = ready.remove(0);
            order[written++] = cue;
            for (int nxt : nextCues[cue]) {
                indegree[nxt] -= 1;
                if (indegree[nxt] == 0) ready.add(nxt);
            }
        }
        if (written != n) return new int[0];
        return order;
    }
}
`,
    },
    "lock-basins": {
        python: `def holdWater(heights):
    left = 0
    right = len(heights) - 1
    left_max = 0
    right_max = 0
    water = 0
    while left < right:
        if heights[left] <= heights[right]:
            left_max = max(left_max, heights[left])
            water += left_max - heights[left]
            left += 1
        else:
            right_max = max(right_max, heights[right])
            water += right_max - heights[right]
            right -= 1
    return water
`,
        cpp: `#include <vector>

long long holdWater(const std::vector<int>& heights) {
    int left = 0;
    int right = (int)heights.size() - 1;
    long long leftMax = 0;
    long long rightMax = 0;
    long long water = 0;
    while (left < right) {
        if (heights[left] <= heights[right]) {
            if (heights[left] > leftMax) leftMax = heights[left];
            water += leftMax - heights[left];
            left += 1;
        } else {
            if (heights[right] > rightMax) rightMax = heights[right];
            water += rightMax - heights[right];
            right -= 1;
        }
    }
    return water;
}
`,
        java: `class Solution {
    public long holdWater(int[] heights) {
        int left = 0;
        int right = heights.length - 1;
        long leftMax = 0;
        long rightMax = 0;
        long water = 0;
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
}
`,
    },
};
