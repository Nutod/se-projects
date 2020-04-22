from abc import ABCMeta, abstractmethod

# Define as metaclass
class ICell(metaclass=ABCMeta):
    """Interface for labyrinth cell"""
    @abstractmethod
    def __str__(self) -> str: pass