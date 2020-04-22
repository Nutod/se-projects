from abc import ABCMeta, abstractmethod

class IPlayer(metaclass=ABCMeta):
    """Interface for the Player Class"""
    
    @abstractmethod
    def move_up(self): pass

    @abstractmethod
    def move_left(self): pass

    @abstractmethod
    def move_down(self): pass

    @abstractmethod
    def move_right(self): pass