from abc import ABCMeta, abstractmethod

class IUserCommand(metaclass = ABCMeta):
    """Interface for all commands"""

    @abstractmethod
    def get_command_tag(self): pass

    @abstractmethod
    def get_args_count(self): pass

    @abstractmethod
    def evaluate(self): pass
