#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr;
    int n = 5;

    arr = (int *) malloc(n * sizeof(int)); // allocate space for 5 ints
    if (arr == NULL) {
        printf("Memory allocation failed!\n");
        return 1;
    }

    // fill array
    for (int i = 0; i < n; i++) {
        arr[i] = i;
        printf("%d ", arr[i]);
    }
    printf("\n");
    n = 10;
    arr = (int *) realloc(arr, n * sizeof(int));

    // fill array
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");

    n = 4;
    arr = (int *) realloc(arr, n * sizeof(int));

    // fill array
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");


    free(arr); // release memory

    return 0;
}
