#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*)malloc(5 * sizeof(int));
    printf("%p\n", &arr[0]);
    *(&arr[0] + 1) = 2;
    printf("%d\n", arr[1]);
    return 0;
}