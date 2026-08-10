# Pointers in C

Every variable in C has an **address**.

A **pointer** is just a variable that stores the address of another variable.

Example:

```c
int a = 10;    // normal variable
int *b = &a;   // pointer storing address of a
```

* `&a` → gives the **address of `a`**.
* `&b` → gives the **address of the pointer `b` itself**.

To get the value stored at the address, we **dereference** the pointer:

```c
*b  // this gives 10, the value of a
```

You can also change the value of `a` through the pointer:

```c
*b = 20;  // now a is 20
```

So basically, pointers = addresses, and `*` lets you reach the value at that address.

---

Pointers are **super important for arrays** too.

Example:

```c
int nums[] = {1, 2, 3, 4, 5};
```

If we pass `nums` to a function, it actually **sends the address of the first element**:

```c
void display(int* nums, int nums_size) {
    for (int i = 0; i < nums_size; i++) {
        printf("%d", nums[i]);
    }
}
```

These two calls are **equivalent**:

```c
display(nums, nums_size);
display(&nums[0], nums_size);
```

**Output:**

```
12345
12345
```

So yeah, arrays and pointers are basically best friends in C. Passing an array to a function is just passing a pointer to its first element