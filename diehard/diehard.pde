import processing.video.*;

PrintWriter output;

Movie theMov; 

void setup() { 
  output = createWriter("pixels.txt"); 
  size(5, 4);
  theMov = new Movie(this, "Die.Hard.mp4");

  theMov.play();  //plays the movie once
}

void draw() { 
  image(theMov, 0, 0); 
} 

void movieEvent(Movie m) { 
   
  if(m.available()) {
    m.read();
    for(int i = 0; i < 21; ++i) {
      color c = get(350 + 1, 152);
      output.print('[');
      output.print((c >> 16) & 0xFF); // r
      output.print(',');
      output.print((c >> 8) & 0xFF); // g
      output.print(',');
      output.print(c & 0xFF); // b
      output.print(']');
      output.print(',');
    }
    output.println();
  } else {
    output.flush();
    output.close();
    exit();
  }
} 
