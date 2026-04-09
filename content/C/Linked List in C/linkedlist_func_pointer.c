#include <stdio.h>
#include <stdlib.h>

typedef struct linked_list_node {
    int value; // 4 byte
    struct linked_list_node *next; // 8 byte
} linked_list;

typedef void (*handle)(linked_list*);

void print_value(linked_list *ll) {
    printf("From print_value::%d\n", ll->value);
}

void display(linked_list *ll, handle callback) {
    while(ll != NULL) { // check until next is null that is end
        callback(ll);
        ll = ll->next; // assign ll to next pointer
    }
}

void reverse_display(linked_list *ll) {
    if(ll != NULL) {
        int old_value = ll->value;
        ll = ll->next;
        reverse_display(ll);
        printf("%d\n", old_value);
    }
}

void free_mem(linked_list *ll) {
    linked_list *temp;
    while(ll != NULL) {
        temp = ll->next; // get next list
        free(ll); // free current list
        ll = temp; // set next list to current list
    }
}

int main() {
    int list_len;
    printf("Struct size %zu\n", sizeof(linked_list)); //
    printf("Enter list size::");
    scanf("%d", &list_len);
    linked_list *head = NULL; // initial null
    linked_list *currentNode = (linked_list*) malloc(sizeof(linked_list)); // allocating linked_list with size of linked_list

    for(int i=0; i<list_len; i++) {
        printf("Enter %dth element::",i);
        scanf("%d", &currentNode->value);
        if (head == NULL) head = currentNode; // set first node to head to keep the starting point

        if (i < list_len-1){
            linked_list *newNode = (linked_list*) malloc(sizeof(linked_list)); // create new node for next itr
            currentNode->next = newNode; // assign the pointer var to stuct next pointer var
            currentNode = newNode; // set currnode to newnode.
        } else {
            currentNode->next = NULL; // safe way to find the list end
        }
    }
    display(head, &print_value);
    reverse_display(head);
    free_mem(head);
    return 0;
}