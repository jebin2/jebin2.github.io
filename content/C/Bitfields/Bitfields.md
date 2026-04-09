# Bitfields

### Syntax

```c
unsigned int <name> : <n(bit limit)>;
```

### Examples

1.

```c
unsigned int FLAG : 1;
```

This means `FLAG` can have **either 0 or 1** — just a single bit.

2.

```c
unsigned int COUNTER : 2;
```

This means `COUNTER` can have **up to 2 bits**, i.e., values from 0–3.

Bitfields help you **save memory** when you know a value only needs a limited range — super useful for **hardware registers** and protocols.

---

### Why `unsigned`?

Because bitfields simulate **hardware bits**, which are **always positive numbers**.

---

### Example: Controller Register

Turn on/off and control volume (up to 10):

```c
struct ControllerRegister {
    unsigned int ON_OFF : 1;  // 1 bit
    unsigned int VOLUME : 4;  // 4 bits
};
```

* `ON_OFF` is **1 bit** → either 0 or 1
* `VOLUME` is **4 bits** → 2^4 = 16 values, but we just need up to 10, so we can **modularize** it

```c
void toggle(struct ControllerRegister *ctlreg) {
    ctlreg->ON_OFF ^= ctlreg->ON_OFF;
}

void vol_change(struct ControllerRegister *ctlreg) {
    ctlreg->VOLUME = (ctlreg->VOLUME + 1) % 10;
}
```

This is a simple way to **toggle** and **change volume**.

* Total memory used for `ControllerRegister` = **5 bits** only!

---

### What happens if we ignore the bit limit?

```c
void vol_change(struct ControllerRegister *ctlreg) {
    ctlreg->VOLUME = ctlreg->VOLUME + 1;
}
```

* If `VOLUME` exceeds 4 bits (max 15), **it wraps automatically**.
* Only the **rightmost bits** are stored; any extra left bits are ignored. But is crucial to do our wrapping implementation