from impl.Bear.Bear import Bear
import random

class Game:
  def __init__(self, Labyrinth, Player, BearClass):
    self.player = Player(Labyrinth)
    self.labyrinth = Labyrinth()
    self.bear = BearClass(Labyrinth)

  def move_up(self):
    status, message, position = self.player.move_up(self.labyrinth.game_area)
    possible_movements = self.bear.compute_bear_movement_possibilities()
    direction = random.choice(possible_movements)
    (bear_movement_variables) = getattr(self.bear, direction)()
    print(message)
    print(bear_movement_variables[1])
    return position == bear_movement_variables[2]
  
  def move_right(self):
    status, message, position = self.player.move_right(self.labyrinth.game_area)
    possible_movements = self.bear.compute_bear_movement_possibilities()
    direction = random.choice(possible_movements)
    bear_movement_variables = getattr(self.bear, direction)()
    print(message)
    print(bear_movement_variables[1])
    return position == bear_movement_variables[2]

  def move_down(self):
    status, message, position = self.player.move_down(self.labyrinth.game_area)
    possible_movements = self.bear.compute_bear_movement_possibilities()
    direction = random.choice(possible_movements)
    bear_movement_variables = getattr(self.bear, direction)()
    print(message, position)
    print(bear_movement_variables[1])
    return position == bear_movement_variables[2]

  def move_left(self):
    status, message, position = self.player.move_left(self.labyrinth.game_area)
    possible_movements = self.bear.compute_bear_movement_possibilities()
    direction = random.choice(possible_movements)
    bear_movement_variables = getattr(self.bear, direction)()
    print(bear_movement_variables[1])
    return position == bear_movement_variables[2]

  def show_map(self):
    self.labyrinth.grid_to_string(self.player.get_player_position())

  def show_full_map(self):
    self.labyrinth.grid_to_string_for_full_map((self.player.get_player_position()), self.bear.get_bear_position())