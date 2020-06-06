from services.Interfaces.ICharacter import ICharacter

class Bear(ICharacter):
  def __init__(self, Labyrinth):
    self.labyrinth = Labyrinth()
    self.position = 51
    self.size = 9

  def initialize_bear_position(self):
    self.position = self.labyrinth.generate_random_start_position()
    return self.position

  def set_bear_position(self, position):
    self.position = position
    return True

  def get_bear_position(self):
    return self.position

  def compute_bear_movement_possibilities(self):
    bear_position = self.position
    move_upwards = bear_position - 1
    move_downwards = bear_position + 1
    move_leftwards = bear_position - self.size
    move_rightwards = bear_position + self.size
    movement_possibility = list()

    if move_upwards in self.labyrinth.game_area:
      movement_possibility.append("move_up")
    if move_downwards in self.labyrinth.game_area:
      movement_possibility.append("move_down")
    if move_leftwards in self.labyrinth.game_area:
      movement_possibility.append("move_left")
    if move_rightwards in self.labyrinth.game_area:
      movement_possibility.append("move_right")
    
    return movement_possibility

  def move_up(self):
    new_position = self.position - 1

    if new_position in self.labyrinth.game_area:
      self.set_bear_position(new_position)

    return (True, "Bear moved up", new_position) if new_position in self.labyrinth.game_area else (False, "Bear position not updated", self.position)

  def move_right(self):
    new_position = self.position + self.size

    if new_position in self.labyrinth.game_area:
      self.set_bear_position(new_position)

    return (True, "Bear moved right", new_position) if new_position in self.labyrinth.game_area else (False, "Bear position not updated", self.position)

  def move_down(self):
    new_position = self.position + 1

    if new_position in self.labyrinth.game_area:
      self.set_bear_position(new_position)

    return (True, "Bear moved down", new_position) if new_position in self.labyrinth.game_area else (False, "Bear position not updated", self.position)

  def move_left(self):
    new_position = self.position - self.size

    if new_position in self.labyrinth.game_area:
      self.set_bear_position(new_position)

    return (True, "Bear moved left", new_position) if new_position in self.labyrinth.game_area else (False, "Bear position not updated", self.position)

  def devour_player(self):
    pass