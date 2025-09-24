# Printing float as int in C

so if you print a float as int in C  
does it give random value?  
ignore decimal?  
error? garbage?  

---

## how float is stored in C

floats are stored in **IEEE 754** format.  

wait what is IEEE 754??  

basically it’s a standard way to represent floating point numbers in binary.  
it splits the 32 bits into:  

- 1 bit for sign  
- 8 bits for exponent  
- 23 bits for fraction (mantissa)  

[Detailed IEEE 754 Explaination](https://larrylu.dev/why-01-02-03-a-deep-dive-into-ieee-754-and-floating-point-arithmetic)

---

## why not just follow int way?

computer only understands 0s and 1s.  

with 32 bits, an `int` can store from `0` to `2^32 - 1 = 4294967295`.  

but floats are trickier — between 1 and 10 alone, there are *infinite* decimal numbers.  
we can’t just shove them into int slots.  

so IEEE 754 came in and said:  
"yo, let’s use scientific notation in binary (like `1.xxx * 2^n`) so we can cover a huge range, not just whole numbers."  

---

## example

```c
#include <stdio.h>

int main() {
  printf("Hello World\n");
  float radius;
  scanf("%f", &radius);
  printf("%i", radius);   // printing float as int
  return 0;
}
````

### output

```
Hello World
3.14
1078523331
```

---

## why that weird number?

* `3.14` as a float is stored in memory as:
  👉 `0x4048F5C3` (check [here](https://float.exposed/0x4048f5c3))

* when you do `printf("%i", radius)`,
  `printf` thinks it’s an `int` and just reinterprets those raw 32 bits.

* `0x4048F5C3` in decimal = `1078523331`
  (check [hex to decimal](https://www.rapidtables.com/convert/number/hex-to-decimal.html?x=4048F5C3))

so nope, it’s not random. it’s just the float’s **bit pattern** being read as an int.

---

## conclusion

printing float as int doesn’t give garbage,
it gives the integer value of the float’s IEEE 754 raw bits.

use:

* `%f` → float
* `%lf` → double
* `%i` or `%d` → int

otherwise, you’ll get numbers like `1078523331` popping up 😅