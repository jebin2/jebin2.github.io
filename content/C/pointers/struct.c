#include <stdio.h>

struct point {
    int x;
    int y;
};

typedef struct {
    int x;
    int y;
} ty_point;

int main() {
    struct point p;
    p.x = 10;
    p.y = 20;

    printf("%d\n", p.x);
    printf("%d\n", p.y);

    ty_point tp;
    tp.x = 30;
    tp.y = 40;

    printf("%d\n", tp.x);
    printf("%d\n", tp.y);
    return 0;
}