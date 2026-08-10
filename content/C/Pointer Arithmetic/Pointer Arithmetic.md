# Pointer Arithmetic

We’ll see what happens if we add or subtract to a pointer address.

To understand this, let’s take a simple 1D array example:

```c
int *matrix = malloc(rows * sizeof(int));
```

When we allocate a 1D array of length `rows` with `sizeof(int)`, it creates memory in a continuous block.

---

Let’s say:

```c
int *temp_mat = malloc(rows * sizeof(int));

temp_mat[0] = 0;
temp_mat[1] = 1123;
```

Just assigning some sample values.

Now check this:

```c
printf("temp_mat: %d", *(&temp_mat[0] + 1));
```

---

### 🔎 What’s happening step by step

* `&temp_mat[0]` → gets the address of the first element
* `+ 1` → moves the pointer forward by one element (not just 1 byte, but `sizeof(int)` bytes)
* `*` → dereferences it, so we get the value at the next index

---

### 📦 Memory Diagram

Suppose `rows = 4`, memory might look like this:

```
Index   Value
-----------------
[0]     0
[1]     1123
[2]     (garbage / uninitialized)
[3]     (garbage / uninitialized)
```

Now:

* `&temp_mat[0]` → points to index **0**
* `(&temp_mat[0] + 1)` → points to index **1**
* `*(&temp_mat[0] + 1)` → gives value at index **1** → `1123`

### The Magic Formula
```
Final_Address = Base_Address + (Index * sizeof(DataType))

Operation       Backend Calculation              Result
arr + 0      →  0x1008 + (0 * 4) = 0x1008 + 0x0  = 0x1008
arr + 1      →  0x1008 + (1 * 4) = 0x1008 + 0x4  = 0x100C  
arr + 2      →  0x1008 + (2 * 4) = 0x1008 + 0x8  = 0x1010
arr + 5      →  0x1008 + (5 * 4) = 0x1008 + 0x14 = 0x101C


Base address:    0x1008
Offset (3*4):   +0x0004
                -------
Result:          0x100C
8 + 4 = 12 which is `C` in Hex
```

---

That’s basically **pointer arithmetic** — we can do math on pointers to move around memory, and then dereference to get the value.