# Player class logic
class Player:
   def __init__(self, x = 20, y = 20, speed = 5):
      # Define the initial state of the Player Object 
      self.x = x
      self.y = y
      self.speed = speed
 
   # Function to move the player right
   def moveRight(self):
      self.x = self.x + self.speed
 
   # Function to move the player left
   def moveLeft(self):
      self.x = self.x - self.speed

   # Function to move the player up
   def moveUp(self):
      self.y = self.y - self.speed
 
   # Function to move the player down
   def moveDown(self):
      self.y = self.y + self.speed