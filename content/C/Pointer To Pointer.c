#include <stdio.h>
#include <stdlib.h>

int main() {
    int a = 10;
    int *b = &a;
    int **c = &b;

    printf("%d\n", a);       // prints 10
    printf("%d\n", *b);      // prints 10
    printf("%d\n", **c);     // prints 10

    printf("address of a : b %p\n", b);    // b stores address of a ✅
    printf("address of b : c %p\n", c);    // c stores address of b ✅

    printf("address of b : &b %p\n", &b);  // &b is address of pointer b ✅
    printf("address of c : &c %p\n", &c);  // &c is address of pointer c ✅

    printf("address of a : *c %p\n", *c);  // *c dereferences c → gives b → address of a ✅

    printf("address of a : &*c %p\n", &*c);  // *c dereferences c → gives b → address of itself same as c ✅

    int rows=2, columns=2;
    int **matrix = malloc(rows * sizeof(int*));
    for (int i=0; i<rows; i++) {
        matrix[i] = malloc(columns * sizeof(int));
    }

    for (int i=0; i<rows; i++) {
        for(int j=0; j<columns; j++) {
            matrix[i][j] = i*j;
        }
    }

    printf("\nmatrix\n");
    for (int i=0; i<rows; i++) {
        for(int j=0; j<columns; j++) {
            printf("%d ", matrix[i][j]);
        }
        printf("\n");
    }
    return 0;
}
