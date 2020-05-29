class Player:
  def __init__(self, Labyrinth):
    self.labyrinth = Labyrinth()
    self.position = 0
    self.size = 8
    self.initialize_player_position()

  def initialize_player_position(self):
    self.position = self.labyrinth.get_player_movement_variables()
    return self.position

  def set_player_position(self, position):
    self.position = position
    return True

  def move_up(self, game_area):
    new_position = self.position - self.size

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Player moved up", new_position) if new_position in game_area else (False, "Player position not updated", self.position)

  def move_right(self, game_area):
    new_position = self.position + 1

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Player moved right", new_position) if new_position in game_area else (False, "Player position not updated", self.position)

  def move_down(self, game_area):
    new_position = self.position - self.size

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Player moved down", new_position) if new_position in game_area else (False, "Player position not updated", self.position)

  def move_left(self, game_area):
    new_position = self.position - 1

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Player moved left", new_position) if new_position in game_area else (False, "Player position not updated", self.position)

