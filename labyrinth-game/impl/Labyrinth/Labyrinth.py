import random
from services.helpers.generate_grid_string import generate_grid_string
from impl.Grid.grid import grid_list

game_grid = random.choice(grid_list)

class Labyrinth:
    """
      Labyrinth class:

      Generates the Grid and provides API to interact with the Grid
    """
    def __init__(self, size=9):
        self.grid = list()
        self.size = size
        self.boundaries = None
        self.game_area = list()
        self.start_position = None
        self._initialize_game_variables()
        self.wormhole_position = None
        self.river_position = list()
        self.set_wormhole_position()

    def _initialize_game_variables(self):
        # Generate a list of the indexes that match a monolith position 
        monoliths_list = list()
        grid = list(range(self.size * self.size))
        monoliths_list.extend(grid[:self.size])
        monoliths_list.extend(grid[-self.size:])
        boundary_index_to_start = self.size
        boundary_index_gap = self.size - 1

        for i in range(self.size - 2):
            monoliths_list.append(grid[boundary_index_to_start])
            monoliths_list.append(
                grid[boundary_index_to_start + boundary_index_gap])
            boundary_index_to_start = boundary_index_to_start + boundary_index_gap + 1

        monoliths_list.sort()
        self.monoliths = monoliths_list
        for idx, item in enumerate(game_grid):
          if item == " ":
            self.game_area.append(idx)
          else:
            continue

    def grid_to_string(self, player_position = 0):
      # Class method that returns the current grid map in a scrambled form
      string_list = list()
      if player_position == 0:
        for index in game_grid:
          string_list.append("#")
      else:
        for count, item in enumerate(game_grid):
          if count == player_position:
            string_list.append("@")
          else:
            string_list.append("#")
      
      generate_grid_string(string_list, self.size)

    def grid_to_string_for_full_map(self, player_position, bear_position):
        # Class method that returns the full grid map
        string_list = list()

        for count, item in enumerate(game_grid):
          if count == player_position:
            string_list.append("@")
          elif count == bear_position:
            string_list.append("B")
          else:
            string_list.append(item)

        generate_grid_string(string_list, self.size)

    def get_winning_move(self):
        pass

    def set_wormhole_position(self):
      for count, item in enumerate(game_grid):
        if item == "W":
          self.wormhole_position = count
        else:
          continue

    def get_wormhole_position(self):
      return self.wormhole_position

    def _set_river_position(self):
      for idx, item in enumerate(game_grid):
        if item == "R":
          self.river_position.append(item)
        else:
          continue

    def get_wormhole_positions(self):
      return self.wormhole_position

    def get_game_area(self):
      return self.game_area

    def get_game_monoliths(self):
      return self.monoliths

    def generate_random_start_position(self):
      start_position = random.choice(self.game_area)
      self.start_position = start_position
      return self.start_position
