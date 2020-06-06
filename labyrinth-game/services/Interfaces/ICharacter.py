from abc import ABCMeta, abstractmethod

class ICharacter(metaclass=ABCMeta):
    """interface for the player and bear class"""
    @abstractmethod
    def move_up(self, position): pass

    @abstractmethod
    def move_down(self, position): pass

    @abstractmethod
    def move_left(self, position): pass

    @abstractmethod
    def move_right(self, position): pass