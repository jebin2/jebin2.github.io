# Pointer to Pointer

This is nothing but storing a pointer **inside another pointer variable**.

Example:

```c
int a = 10;
int *b = &a;
int **c = &b;
```

**Meaning:**

* `b` stores the address of `a`
* `c` stores the address of `b`

Now, if we want to get the value of `a` using `c`:

* `c` has the address of `b`
* Dereferencing once → `*c` gives the address of `a`
* Dereferencing again → `**c` gives the value of `a`

---

## Visual (ASCII Diagram)

```
   +-----+      +-----+      +-----+
   |  a  | ---> |  b  | ---> |  c  |
   +-----+      +-----+      +-----+

a = 10
b = &a
c = &b

*c  = b   → address of a
**c = *b  → value of a (10)
```

---

## Why use this?

This is super helpful when working with **multi-dimensional arrays**.

Example:

```c
int **matrix = malloc(rows * sizeof(int*));
for (int i = 0; i < rows; i++) {
    matrix[i] = malloc(columns * sizeof(int));
}
```

### Breaking it down:

* `int **matrix = malloc(rows * sizeof(int*));`
  → Allocates a 1D array of length `rows`, where each element is a pointer (`int*`).

* `matrix[i] = malloc(columns * sizeof(int));`
  → Allocates a 1D array of `columns` integers for each row.

So in the end, you’ve built a **2D array dynamically** using pointer-to-pointer.

---

## Visualizing the 2D Array

Let’s say `rows = 3` and `columns = 4`.

```
matrix
   |
   v
+--------+      +-----------+-----------+-----------+-----------+
| row[0] | ---> | col[0]    | col[1]    | col[2]    | col[3]    |
+--------+      +-----------+-----------+-----------+-----------+

+--------+      +-----------+-----------+-----------+-----------+
| row[1] | ---> | col[0]    | col[1]    | col[2]    | col[3]    |
+--------+      +-----------+-----------+-----------+-----------+

+--------+      +-----------+-----------+-----------+-----------+
| row[2] | ---> | col[0]    | col[1]    | col[2]    | col[3]    |
+--------+      +-----------+-----------+-----------+-----------+
```

Here:

* `matrix` is a pointer to an array of row pointers.
* Each `matrix[i]` points to an array of integers (the columns).
* Accessing `matrix[i][j]` jumps through both levels of pointers.