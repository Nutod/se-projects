from services.Interfaces.ICharacter import ICharacter

class Player(ICharacter):
  def __init__(self, Labyrinth):
    self.labyrinth = Labyrinth()
    self.position = 0
    self.size = 9
    self.initialize_player_position()

  def initialize_player_position(self):
    self.position = self.labyrinth.generate_random_start_position()
    return self.position

  def set_player_position(self, position):
    self.position = position
    return True

  def get_player_position(self):
    return self.position

  def move_up(self, game_area):
    new_position = self.position - 1

    if new_position == self.labyrinth.get_wormhole_position():
      return (False, "You have entered a wormhole", new_position)

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Step executed", new_position) if new_position in game_area else (False, "Step impossible, wall detected", self.position)

  def move_right(self, game_area):
    new_position = self.position + self.size

    if new_position == self.labyrinth.get_wormhole_position():
      return (False, "You have entered a wormhole", new_position)

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Step executed", new_position) if new_position in game_area else (False, "Step impossible, wall detected", self.position)

  def move_down(self, game_area):
    new_position = self.position + 1

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Step executed", new_position) if new_position in game_area else (False, "Step impossible, wall detected", self.position)

  def move_left(self, game_area):
    new_position = self.position - self.size

    if new_position == self.labyrinth.get_wormhole_position():
      return (False, "You have entered a wormhole", new_position)

    if new_position in game_area:
      self.set_player_position(new_position)

    return (True, "Step executed", new_position) if new_position in game_area else (False, "Step impossible, wall detected", self.position)

