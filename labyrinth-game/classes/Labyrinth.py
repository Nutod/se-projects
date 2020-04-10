class Labyrinth:
    def __init__(self):
       self.Y_AXIS = 10
       self.X_AXIS = 8
       self.labyrinth = [ 1,1,1,1,1,1,1,1,1,1,
                     1,0,0,0,0,0,0,0,0,1,
                     1,0,0,0,0,0,0,0,0,1,
                     1,0,1,1,1,1,1,1,0,1,
                     1,0,1,0,0,0,0,0,0,1,
                     1,0,1,0,1,1,1,1,0,1,
                     1,0,0,0,0,0,0,0,0,1,
                     1,1,1,1,1,1,1,1,1,1 ]

    def draw(self,display_surf,image_surf):
       bx = 0
       by = 0
       for i in range(0,self.Y_AXIS*self.X_AXIS):
           if self.labyrinth[ bx + (by*self.Y_AXIS) ] == 1:
               display_surf.blit(image_surf,( bx * 44 , by * 44))
      
           bx = bx + 1
           if bx > self.Y_AXIS-1:
               bx = 0 
               by = by + 1