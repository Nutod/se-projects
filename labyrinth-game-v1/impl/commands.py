import sys
import random
from abc import *
from enum import Enum

from abstract.IUserCommand import IUserCommand

""" Game Control Commands """
class Exit(IUserCommand):
    """ Exit command to stop the game"""
    def get_command_tag(self):
        return "exit"

    def get_args_count(self):
        return 0

    def evaluate(self, args):
        return True, "Game is exiting"


""" Direction Commands """
class MoveUp(IUserCommand):
    def get_command_tag(self):
        return "up"

    def get_args_count(self):
        return 0

    def evaluate(self, args):
        return (True, "State Updated")

class MoveUpShortForm(MoveUp):
    def get_command_tag(self):
        return "w"

class MoveLeft(IUserCommand):
    def get_command_tag(self):
        return "left"

    def get_args_count(self):
        return 0

    def evaluate(self, args):
        return (True, "State Updated")

class MoveLeftShortForm(MoveLeft):
    def get_command_tag(self):
        return "a"

class MoveDown(IUserCommand):
    def get_command_tag(self):
        return "down"

    def get_args_count(self):
        return 0

    def evaluate(self, args):
        return (True, "State Updated")

class MoveDownShortForm(MoveDown):
    def get_command_tag(self):
        return "s"

class MoveRight(IUserCommand):
    def get_command_tag(self):
        return "right"

    def get_args_count(self):
        return 0

    def evaluate(self, args):
        return (True, "State Updated")

class MoveRightShortForm(MoveRight):
    def get_command_tag(self):
        return "d"