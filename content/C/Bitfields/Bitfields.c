#include <stdio.h>

struct Register {
    unsigned int ERROR : 1;
    unsigned int READY : 1;
    unsigned int UNUSED : 3;
    unsigned int BUSY : 1;
    unsigned int COUNT : 2;
};

void toggle_busy(struct Register *reg) {
    reg->BUSY = !reg->BUSY;
}

void inc(struct Register *reg) {
    reg->COUNT = (reg->COUNT + 1) % 4;
}

void display(struct Register *reg) {
    printf("ERROR = %u\n", reg->ERROR);
    printf("READY = %u\n", reg->READY);
    printf("UNUSED = %u\n", reg->UNUSED);
    printf("BUSY = %u\n", reg->BUSY);
    printf("COUNT = %u\n", reg->COUNT);
    printf("----------------\n");
}

void task_2() {
    struct Register reg = {0};
    int choice = -1;
    while(1) {
        printf("Enter Choice\n1-toggle BUSY\n2-inc COUNT\n3-Display\n0-Exit:: ");
        scanf("%d", &choice);

        if(choice == 0) {
            display(&reg);
            break;
        } else if(choice == 1) {
            toggle_busy(&reg);
            display(&reg);
        } else if(choice == 2) {
            inc(&reg);
            display(&reg);
        } else if(choice == 3) {
            display(&reg);
        }
    }

    reg = (struct Register){0};
}

union microreg {
    struct {
        unsigned int VALUE : 4;
        unsigned int FLAG1 : 1;
        unsigned int FLAG2 : 1;
        unsigned int FLAG3 : 1;
        unsigned int ENABLE: 1;
    } bits;
    unsigned char reg_byte;
};

void task_3() {
    union microreg mr = {0};
    printf("0x%02X\n", mr.reg_byte);
    mr.bits.ENABLE = 1;
    mr.bits.VALUE = 5;
    printf("0x%02X\n", mr.reg_byte);
    mr.reg_byte &= ~(1 << 7);
    printf("0x%02X\n", mr.reg_byte);
    printf("0x%02X\n", mr.bits.FLAG2);
    mr.reg_byte ^= (1 << 5);
    printf("0x%02X\n", mr.reg_byte);
    printf("0x%02X\n", mr.bits.FLAG2);
}

int main() {
    task_2();
    task_3();
    return 0;
}