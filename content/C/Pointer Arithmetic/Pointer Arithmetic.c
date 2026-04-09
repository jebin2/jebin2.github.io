// ## **Mini Challenge**

// **Goal:** Create a dynamic 2D array, fill it with multiples of row and column indices, and print it.

// **Steps:**

// 1. Ask the user for number of rows and columns.
// 2. Allocate a 2D dynamic array (`int**`).
// 3. Fill each element with: `arr[i][j] = i * j`.
// 4. Print the 2D array.
// 5. Free the memory.

// **Extra twist:** Use only **pointer arithmetic** (no `arr[i][j]` syntax).

#include <stdio.h>
#include <stdlib.h>

void get_value_by_add_address(int rows) {
    int *temp_mat = malloc(rows * sizeof(int));
    temp_mat[0] = 0;
    temp_mat[1] = 1123;
    printf("temp_mat: %d", *(&temp_mat[0] + 1));
}

int main() {
    int rows, columns;
    printf("Enter Number of Rows:");
    scanf("%d", &rows);
    printf("\nEnter Number of Columns:");
    scanf("%d", &columns);

    get_value_by_add_address(rows);

    printf("\nCreating an array %dx%d", rows, columns);
    int **matrix = malloc(rows * sizeof(int*)); // allocate 1D array of length rows with the sizeof pointer each.
    for (int i=0; i<rows; i++) {
        matrix[i] = malloc(columns * sizeof(int)); // allocate 1D array of length columns in each row with the sizeof int each.
    }

    for (int i=0; i<rows; i++) {
        for(int j=0; j<columns; j++) {
            *(matrix[i] + j) = i*j; // matrix[i] give address, malloc allocate memory continuously hence adding column in enough to get next cell and dereference (*) stores value at that location
        }
    }

    printf("\nmatrix\n");
    for (int i=0; i<rows; i++) {
        for(int j=0; j<columns; j++) {
            printf("%d ", *(matrix[i] + j));
        }
        printf("\n");
    }

    for (int i=0; i<rows; i++) {
        free(matrix[i]);
    }
    free(matrix);
    return 0;
}