import math

def generate_grid_string(list_item, rows):
    columns = int(math.ceil(len(list_item) / rows))
    for i in range(min(rows, len(list_item))):
        for j in range(columns):
            next_column_i = i + rows * j
            if next_column_i < len(list_item):
                print(list_item[next_column_i], end=' ')
        print()