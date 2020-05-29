from pyfiglet import Figlet

from impl.Player.Player import Player
from impl.Labyrinth.Labyrinth import Labyrinth
from impl.Bear.Bear import Bear
from impl.commands import commands
from game import Game

f = Figlet(font="slant")

commands_list = commands()


def get_command_list():
    # Return a set of commands
    return [*commands_list]


def is_command_supported(cmd):
    return True if cmd in get_command_list() else False


def run_command(game, cmd):
  return getattr(game, commands_list[cmd])()


if __name__ == "__main__":
    finished = False
    print(f.renderText("Labyrinth....."))
    print("The following commands are recognised: ")
    print("up or w to move up")
    print("down or s to move down")
    print("left or a to move left")
    print("right or d to move right")
    print("Input a command")

    GameApplication = Game(Labyrinth, Player, Bear)

    while not finished:
        command = input("$> ")

        if command == "q":
            finished = True
        elif is_command_supported(command.lower()):
            game_status = run_command(GameApplication, command)
            finished = game_status
        else:
            print("Command not recognised")
