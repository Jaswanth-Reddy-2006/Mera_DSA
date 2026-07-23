export interface FlatFormulaItem {
  id: string;
  title: string;
  syntax: string;
  description: string;
  declaration: string;
  insertion: string;
  lookup: string;
  deletion: string;
  iteration: string;
  sizeCheck: string;
}

export const FLAT_FORMULA_ITEMS: FlatFormulaItem[] = [
  {
    id: 'unordered_map',
    title: 'unordered_map (Hash Map)',
    syntax: 'unordered_map<key_type, value_type> mp;',
    description: 'Unordered Hash Map key-value store in C++ STL.',
    declaration: 'unordered_map<int, int> mp;\nunordered_map<string, vector<int>> adj;\nunordered_map<int, int> freq;',
    insertion: 'mp[key] = value;          // Operator[]\nmp.insert({key, value});  // Insert Pair\nmp.emplace(key, value);   // Emplace In-Place',
    lookup: 'if (mp.count(key)) { /* key exists */ }\nif (mp.find(key) != mp.end()) { int val = mp[key]; }',
    deletion: 'mp.erase(key);          // Erase by key\nmp.erase(mp.find(key)); // Erase by iterator\nmp.clear();             // Empty entire map',
    iteration: 'for (auto &[key, val] : mp) {\n    cout << key << " -> " << val << "\\n";\n}',
    sizeCheck: 'int sz = mp.size();\nbool isEmpty = mp.empty();'
  },
  {
    id: 'map',
    title: 'std::map (Ordered Map)',
    syntax: 'map<key_type, value_type> mp;',
    description: 'Ordered Red-Black BST Map kept strictly sorted by keys.',
    declaration: 'map<int, string> mp;',
    insertion: 'mp[10] = "ten";\nmp.insert({5, "five"});\nmp.emplace(20, "twenty");',
    lookup: 'if (mp.count(5)) { /* exists */ }\nauto itLow = mp.lower_bound(5); // First key >= 5\nauto itUp = mp.upper_bound(5);  // First key > 5',
    deletion: 'mp.erase(5);\nmp.erase(mp.find(10));\nmp.clear();',
    iteration: 'for (auto &[key, val] : mp) {\n    cout << key << " -> " << val << "\\n"; // Always sorted by key\n}',
    sizeCheck: 'int sz = mp.size();\nbool isEmpty = mp.empty();'
  },
  {
    id: 'unordered_set',
    title: 'unordered_set (Hash Set)',
    syntax: 'unordered_set<element_type> st;',
    description: 'Unordered Hash Set storing unique elements.',
    declaration: 'unordered_set<int> st;\nunordered_set<string> strSet;',
    insertion: 'st.insert(10);\nst.insert(20);\nst.emplace(30);',
    lookup: 'if (st.count(10)) { /* 10 exists */ }\nif (st.find(20) != st.end()) { /* found */ }',
    deletion: 'st.erase(10);\nst.erase(st.find(20));\nst.clear();',
    iteration: 'for (int x : st) {\n    cout << x << " ";\n}',
    sizeCheck: 'int sz = st.size();\nbool isEmpty = st.empty();'
  },
  {
    id: 'set',
    title: 'std::set (Ordered Set)',
    syntax: 'set<element_type> st;',
    description: 'Ordered Set kept strictly sorted in ascending order.',
    declaration: 'set<int> st = {5, 1, 9, 3};',
    insertion: 'st.insert(7);\nst.emplace(2);',
    lookup: 'if (st.count(7)) { /* exists */ }\nauto itLow = st.lower_bound(4); // First element >= 4 (points to 5)\nauto itUp = st.upper_bound(5);  // First element > 5 (points to 7)',
    deletion: 'st.erase(7);\nst.clear();',
    iteration: 'for (int x : st) {\n    cout << x << " "; // Outputs: 1, 2, 3, 5, 9\n}',
    sizeCheck: 'int sz = st.size();\nbool isEmpty = st.empty();'
  },
  {
    id: 'multiset',
    title: 'std::multiset (Duplicate Set)',
    syntax: 'multiset<element_type> ms;',
    description: 'Ordered set allowing duplicate elements.',
    declaration: 'multiset<int> ms;',
    insertion: 'ms.insert(5);\nms.insert(5); // Duplicates allowed',
    lookup: 'int freq = ms.count(5); // Freq count of 5\nauto it = ms.find(5);  // Iterator to first 5',
    deletion: 'ms.erase(5);               // ERASE ALL 5s!\nms.erase(ms.find(5));       // Erase ONLY ONE 5!',
    iteration: 'for (int x : ms) {\n    cout << x << " ";\n}',
    sizeCheck: 'int sz = ms.size();\nbool isEmpty = ms.empty();'
  },
  {
    id: 'vector',
    title: 'std::vector (Dynamic Array)',
    syntax: 'vector<T> vec;',
    description: 'Dynamic contiguous memory array in C++ STL.',
    declaration: 'vector<int> vec;\nvector<int> vecFixed(10, 0); // 10 elements initialized to 0\nvector<vector<int>> grid(r, vector<int>(c, -1)); // 2D Grid',
    insertion: 'vec.push_back(10);\nvec.emplace_back(20);\nvec.insert(vec.begin() + 1, 99); // Insert at index 1',
    lookup: 'int first = vec.front();\nint last = vec.back();\nint val = vec[idx];',
    deletion: 'vec.pop_back();\nvec.erase(vec.begin() + idx); // Erase element at index idx\nvec.clear();',
    iteration: 'for (int i = 0; i < vec.size(); ++i) cout << vec[i];\nfor (int x : vec) cout << x;',
    sizeCheck: 'int sz = vec.size();\nbool isEmpty = vec.empty();'
  },
  {
    id: 'pair_tuple',
    title: 'std::pair & std::tuple',
    syntax: 'pair<T1, T2> p; tuple<T1, T2, T3> t;',
    description: 'Combine 2 or 3 data types together.',
    declaration: 'pair<int, string> p = {1, "leetcode"};\ntuple<int, string, double> t = {101, "Alice", 98.5};',
    insertion: 'vector<pair<int, int>> vecOfPairs;\nvecOfPairs.push_back({10, 20});\nvecOfPairs.emplace_back(30, 40);',
    lookup: 'int id = p.first;\nstring s = p.second;\nint tId = get<0>(t);\nstring tName = get<1>(t);',
    deletion: 'N/A',
    iteration: 'auto [a, b, c] = t; // Structured Binding (C++17)',
    sizeCheck: 'N/A'
  },
  {
    id: 'priority_queue',
    title: 'priority_queue (Heap)',
    syntax: 'priority_queue<T> maxHeap; priority_queue<T, vector<T>, greater<T>> minHeap;',
    description: 'Binary Heap data structure for O(log N) min/max operations.',
    declaration: 'priority_queue<int> maxHeap; // Max Heap\npriority_queue<int, vector<int>, greater<int>> minHeap; // Min Heap',
    insertion: 'maxHeap.push(10);\nmaxHeap.emplace(50);',
    lookup: 'int topVal = maxHeap.top(); // Read top max/min element',
    deletion: 'maxHeap.pop(); // Remove top max/min element',
    iteration: 'while (!maxHeap.empty()) {\n    int val = maxHeap.top();\n    maxHeap.pop();\n}',
    sizeCheck: 'int sz = maxHeap.size();\nbool isEmpty = maxHeap.empty();'
  },
  {
    id: 'stack_queue_deque',
    title: 'stack, queue & deque',
    syntax: 'stack<T> st; queue<T> q; deque<T> dq;',
    description: 'LIFO Stack, FIFO Queue, and Double-Ended Queue.',
    declaration: 'stack<int> st;\nqueue<int> q;\ndeque<int> dq;',
    insertion: 'st.push(10);\nq.push(20);\ndq.push_front(1); dq.push_back(2);',
    lookup: 'int stTop = st.top();\nint qFront = q.front();\nint dqFront = dq.front(); int dqBack = dq.back();',
    deletion: 'st.pop();\nq.pop();\ndq.pop_front(); dq.pop_back();',
    iteration: 'deque supports random indexing dq[i] and iteration for (int x : dq)',
    sizeCheck: 'int sz = st.size();\nbool isEmpty = st.empty();'
  },
  {
    id: 'strings',
    title: 'std::string Operations',
    syntax: 'string s = "leetcode";',
    description: 'String manipulation, substring, find, and replace in C++.',
    declaration: 'string s = "leetcode";\nstring s2(5, \'a\'); // "aaaaa"',
    insertion: 's += " code";\ns.push_back(\'!\');\ns.append(" 2026");',
    lookup: 'char c = s[0];\nsize_t foundIdx = s.find("code"); // Returns index or string::npos\nif (foundIdx != string::npos) { /* found */ }\nstring sub = s.substr(0, 4); // Substring (start, length) -> "leet"',
    deletion: 's.pop_back();\ns.erase(0, 4); // Erase length 4 from index 0\ns.clear();',
    iteration: 'for (char c : s) cout << c;\nfor (int i = 0; i < s.size(); ++i)',
    sizeCheck: 'int len = s.length(); // or s.size()\nbool isEmpty = s.empty();'
  },
  {
    id: 'stl_algorithm',
    title: 'C++ STL Algorithms',
    syntax: 'sort() | reverse() | binary_search() | lower_bound() | upper_bound()',
    description: 'Comprehensive C++ STL algorithm headers (<algorithm>, <numeric>).',
    declaration: 'vector<int> arr = {4, 2, 8, 1, 5};',
    insertion: 'sort(arr.begin(), arr.end());                  // Ascending\nsort(arr.rbegin(), arr.rend());                // Descending\nreverse(arr.begin(), arr.end());              // Reverse element order\nfill(arr.begin(), arr.end(), -1);              // Fill with value -1\niota(arr.begin(), arr.end(), 1);               // Fill 1, 2, 3, 4, 5',
    lookup: 'bool exists = binary_search(arr.begin(), arr.end(), 5); // Must be sorted\nauto itLow = lower_bound(arr.begin(), arr.end(), 4);  // First element >= 4\nauto itUp = upper_bound(arr.begin(), arr.end(), 4);   // First element > 4\nint minVal = *min_element(arr.begin(), arr.end());\nint maxVal = *max_element(arr.begin(), arr.end());',
    deletion: 'auto newEnd = unique(arr.begin(), arr.end()); // Remove consecutive duplicates\narr.erase(newEnd, arr.end());',
    iteration: 'next_permutation(arr.begin(), arr.end()); // Generate next lexicographical permutation\nlong long sum = accumulate(arr.begin(), arr.end(), 0LL);',
    sizeCheck: 'N/A'
  },
  {
    id: 'type_conversions',
    title: 'C++ Type Conversions',
    syntax: 'to_string() | stoi() | stoll() | stod() | ch - \'0\'',
    description: 'Convert between string, int, char, and double in C++.',
    declaration: 'string str = "123";\nint num = 42;\nchar c = \'9\';',
    insertion: 'string s = to_string(num); // "42"\nint val = stoi(str); // 123\nlong long llVal = stoll("9876543210");',
    lookup: 'int digit = c - \'0\'; // 9\nchar digitChar = 9 + \'0\'; // \'9\'\ndouble dbl = static_cast<double>(5) / 2; // 2.5',
    deletion: 'N/A',
    iteration: 'stringstream ss("hello world"); string word; while(ss >> word) { /* split by space */ }',
    sizeCheck: 'N/A'
  },
  {
    id: 'bit_manipulation',
    title: 'Bit Manipulation Operations',
    syntax: 'n & (1 << i) | n | (1 << i) | n ^ (1 << i) | __builtin_popcount()',
    description: 'Bitwise operation tricks in C++.',
    declaration: 'int n = 29; // 11101 in binary',
    insertion: 'n = n | (1 << i);   // Set i-th bit to 1\nn = n ^ (1 << i);   // Toggle i-th bit',
    lookup: 'bool isSet = (n & (1 << i)) != 0; // Check i-th bit\nbool isPowerOfTwo = (n > 0) && ((n & (n - 1)) == 0);',
    deletion: 'n = n & ~(1 << i);  // Clear i-th bit to 0\nn = n & (n - 1);     // Clear lowest set 1-bit',
    iteration: 'int setBits = __builtin_popcount(n); // Count 1-bits\nint leadingZeros = __builtin_clz(n);',
    sizeCheck: 'N/A'
  },
  {
    id: 'fast_io',
    title: 'Competitive Fast I/O Template',
    syntax: 'ios_base::sync_with_stdio(false); cin.tie(NULL);',
    description: 'Fast input/output header template for competitive programming.',
    declaration: '#include <bits/stdc++.h>\nusing namespace std;',
    insertion: 'int main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Code here\n    return 0;\n}',
    lookup: 'N/A',
    deletion: 'N/A',
    iteration: 'N/A',
    sizeCheck: 'N/A'
  }
];
