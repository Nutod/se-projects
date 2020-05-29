import random
from services.helpers.generate_grid_string import generate_grid_string

# TODO: Update this to a factory function
level_one = [
  "*", "*", "*", "*", "*", "*", "*", "*", "*",
  "*", "$", "X", " ", "X", " ", "X", " ", "*",
  "*", " ", " ", " ", " ", " ", " ", " ", "*",
  "*", "X", "W", " ", "X", " ", "X", " ", "*",
  "*", " ", " ", " ", " ", " ", " ", "X", "*",
  "*", "#", "#", "X", "X", "X", " ", "X", "*",
  "*", "#", "#", " ", " ", " ", " ", " ", "*",
  "*", " ", " ", " ", "X", "X", "X", " ", "*",
  "*", "*", "*", " ", "*", "*", "*", "*", "*",
]

class Labyrinth:
    def __init__(self, size=9):
        self.grid = list()
        self.size = size
        self.boundaries = None
        self.game_area = list()
        self.start_position = None
        self.initialize_array_indexes()
        self.wormhole_position = None
        self.set_wormhole_position()

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
        for count, item in enumerate(level_one):
          if item == " ":
            self.game_area.append(count)
          else:
            continue

    def initialize_game_variables(self):
        pass

    def grid_to_string(self, player_position = 0):
      string_list = list()
      if player_position == 0:
        for index in level_one:
          string_list.append("#")
      else:
        for count, item in enumerate(level_one):
          if count == player_position:
            string_list.append("@")
          else:
            string_list.append("#")
      
      generate_grid_string(string_list, self.size)

    def grid_to_string_for_full_map(self, player_position, bear_position):
        string_list = list()

        for count, item in enumerate(level_one):
          if count == player_position:
            string_list.append("@")
          elif count == bear_position:
            string_list.append("B")
          else:
            string_list.append(item)

        generate_grid_string(string_list, self.size)

    def generate_grid(self):
        self.initialize_game_variables()

    def get_winning_move(self):
        pass

    def set_wormhole_position(self):
      for count, item in enumerate(level_one):
        if item == "W":
          self.wormhole_position = count
        else:
          continue

    def get_wormhole_position(self):
      return self.wormhole_position

    def get_game_area(self):
      return self.game_area

    def get_game_boundaries(self):
      return self.boundaries

    def generate_random_start_position(self):
      start_position = random.choice(self.game_area)
      self.start_position = start_position
      return self.start_position
