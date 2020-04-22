from abc import ABCMeta, abstractmethod

class IUserCommand(metaclass = ABCMeta):
    """Interface for all commands"""

    @abstractmethod
    def get_command(self): pass
