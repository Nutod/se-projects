class IPlayer():
   """interface for the Player class"""
   @abstractmethod
   def moveUp(self): pass

   @abstractmethod
   def moveDown(self): pass

   @abstractmethod
   def moveLeft(self): pass

   @abstractmethod
   def moveRight(self): pass