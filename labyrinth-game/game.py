import turtle

game_window = turtle.Screen()
game_window.bgcolor('black')
game_window.title('Labyrinth')
game_window.setup(600, 600)

class Pen(turtle.Turtle):
    def __init__(self):
        turtle.Turtle.__init__(self)
        self.shape('square')
        self.color('white')
        self.penup()
        self.speed(0)

levels = [""]

level_1 = [
    "###################",
    "# # #### ###### ###",
    "# ###### ### ######",
    "### ### ### ### ###",
    "##### #### ########",
    "### #### ### ####  ",
    "# #### ### ### # ##",
    "###################",
]

levels.append(level_1)

def setup_maze(level):
    for y in range(len(level)):
        for x in range(len(level[y])):
            character = level[y][x]

            screen_x = -288 + (x * 24)
            screen_y = 288 - (y - 24)

            if character == '#':
                pen.goto(screen_x, screen_y)
                pen.stamp()

pen = Pen()

setup_maze(levels[1])

