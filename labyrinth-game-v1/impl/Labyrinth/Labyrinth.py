import random
from services.helpers.create_empty_list import create_empty_list
from services.helpers.generate_grid_string import generate_grid_string

def map_symbol_to_display(index, boundaries, game_area):
    if index in boundaries:
      return "*"
    elif index in game_area:
      return random.choice(["-", "|"])
    else:
      return " "

class Labyrinth:
    def __init__(self, size=8):
        self.grid = list()
        self.size = size
        self.boundaries = None
        self.game_area = None
        self.current_position = None
        self.initialize_array_indexes()
        self.initialize_game_variables()

    def initialize_array_indexes(self):
        boundaries_list = list()
        actual_list = list(range(self.size * self.size))
        boundaries_list.extend(actual_list[:self.size])
        boundaries_list.extend(actual_list[-self.size:])
        boundary_index_to_start = self.size
        boundary_index_gap = self.size - 1

        for i in range(self.size - 2):
            boundaries_list.append(actual_list[boundary_index_to_start])
            boundaries_list.append(
                actual_list[boundary_index_to_start + boundary_index_gap])
            boundary_index_to_start = boundary_index_to_start + boundary_index_gap + 1

        boundaries_list.sort()
        self.boundaries = boundaries_list
        self.game_area = [index for index in actual_list if index not in boundaries_list]

    def initialize_game_variables(self):
        for idx in range(self.size * self.size):
            self.grid.append({
                "position":
                idx,
                "type":
                "Wall" if idx in self.boundaries else "Cell",
                "representation": {
                    "explicit": map_symbol_to_display(idx, self.boundaries, self.game_area),
                    "implicit": "#"
                }
            })

    def grid_to_string(self):
        string_list = list()
        for grid_item in self.grid:
            string_list.append(grid_item["representation"]["explicit"])
        generate_grid_string(string_list, self.size)

    def generate_grid(self):
        self.initialize_game_variables()

    def get_winning_move(self):
        pass
        
    def grid_to_implicit_string(self):
        implicit_grid_list = list()
        for grid_item in self.grid:
            implicit_grid_list.append(grid_item["representation"]["implicit"])

    def start_game(self):
        self.current_position = random.choice(self.game_area) - 1

    def get_game_area(self):
      return self.game_area

    def get_game_boundaries(self):
      return self.boundaries

    def get_player_movement_variables(self):
      initial_position = random.choice(self.game_area) - 1
      print("Initial position", initial_position)
      self.current_position = initial_position
      return self.current_position
