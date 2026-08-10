# Implementing Linked List in C

### Step 1) Define struct

```c
typedef struct linked_list_node {
    int value;
    struct linked_list_node *next;
} linked_list;
```

* `value` → stores the data
* `*next` → stores the address of the next node

---

### Step 2) Setup head and current node

We need a **head** node to keep track of the beginning:

```c
linked_list *head = NULL;
```

Now let’s define a **current node** using `malloc`:

```c
linked_list *current_node = (linked_list*) malloc(sizeof(linked_list));
```

---

### Step 3) Insert values

Now we can ask for linked list length and iterate.

On the **first iteration**, after getting the first value, store it in head:

```c
scanf("%d", &current_node->value);
if (head == NULL) head = current_node;
```

Now create a **new node**, store its address, and move the current pointer:

```c
linked_list *newNode = (linked_list*) malloc(sizeof(linked_list));
current_node->next = newNode;
current_node = newNode;
```

Atlast set the last node’s `next` to `NULL`(Better to have know value then garbage value):

```c
current_node->next = NULL;
```


---

### Step 4) Print the result

Just pass the head variable where we stored the first value.
Iterate until `next` is `NULL`:

```c
void display(linked_list *ll) {
    while (ll != NULL) { // check until end of list
        printf("%d\n", ll->value);
        ll = ll->next; // move to next node
    }
}
```


### Full Working Code

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct linked_list_node {
    int value; // 4 byte
    struct linked_list_node *next; // 8 byte
} linked_list;

void display(linked_list *ll) {
    while(ll != NULL) { 
        printf("%d\n", ll->value);
        ll = ll->next; 
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
        temp = ll->next;
        free(ll);
        ll = temp;
    }
}

int main() {
    int list_len;
    printf("Struct size %zu\n", sizeof(linked_list));
    printf("Enter list size::");
    scanf("%d", &list_len);

    linked_list *head = NULL;
    linked_list *current_node = (linked_list*) malloc(sizeof(linked_list));

    for(int i=0; i<list_len; i++) {
        printf("Enter %dth element::", i);
        scanf("%d", &current_node->value);

        if (head == NULL) head = current_node;

        if (i < list_len-1){
            linked_list *newNode = (linked_list*) malloc(sizeof(linked_list));
            current_node->next = newNode;
            current_node = newNode;
        } else {
            current_node->next = NULL;
        }
    }

    display(head);
    reverse_display(head);
    free_mem(head);

    return 0;
}
```