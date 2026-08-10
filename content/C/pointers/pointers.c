#include <stdio.h>

int add(int *a, int b) {
    *a += b;
}

int swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void display(int* nums, int nums_size){
    for (int i=0; i<nums_size; i++) {
        printf("%d", nums[i]);
    }
}

int main() {
    int y = 10;
    int *x = &y;

    printf("x (address of y)      : %p\n", x);
    printf("&x (address of x): %p\n", (void*)&x);
    printf("*x (value of y)       : %d\n", *x);

    add(&y, 10);
    printf("after adding 10:: %d\n", y);

    int a = 10;
    int b = 20;
    printf("a:: %d\n", a);
    printf("b:: %d\n", b);
    swap(&a, &b);
    printf("a:: %d\n", a);
    printf("b:: %d\n", b);

    int nums[] = {1, 2, 3, 4, 5};
    int nums_size = sizeof(nums)/sizeof(nums[0]);
    printf("size:: %d\n", nums_size);
    display(nums, nums_size); // arr in c decays to pointer send only address of first element
    printf("\n");
    display(&nums[0], nums_size); // same as above
    printf("\n");
    return 0;
}

