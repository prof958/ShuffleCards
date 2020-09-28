//Defining global variables
var draggedBox = -1;
var images = [];
var boxes = [];
var resizing = false;
var animationSpeed = 10.0;
var boxCount = 7;


//Class for Vector calculations
//Working with P5's Vectors was not enough for me and my calculations
class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  magnitude() {
    return dist(this.x, this.y, 0, 0);
  }

  normalize() {
    var magnitude = this.magnitude();
    return new Vector2(this.x / magnitude, this.y / magnitude);
  }

  differenceTo(otherVector) {
    return new Vector2(otherVector.x - this.x, otherVector.y - this.y);
  }

  scale(scaleNum) {
    return new Vector2(this.x * scaleNum, this.y * scaleNum);
  }

  translateBy(otherVector) {
    return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
  }

}

//Box class for creating box objects
class Box {

  constructor(img, position) {
    this.assignedPosition = position;
    this.position = position;
    this.img = img;
    this.dragging = false;
    this.width = windowWidth / 10;
    this.height = windowWidth / 10;
    this.show();
  }

  //Controlling clicks and enabling dragging
  clicked() {

    this.dragging = mouseHitTest(this.position);
    return this.dragging;

  }

  update() {
    //Dragging with mouse on clicked object
    if (this.dragging) {
      this.position = new Vector2(mouseX, mouseY);
    }
    //Or resetting box locations based on mouse event.
    else {
      var delta = this.position.differenceTo(this.assignedPosition)
      var normDelta = delta.normalize();
      if (delta.magnitude() > animationSpeed) {
        this.position = this.position.translateBy(normDelta.scale(animationSpeed));
      } else {
        this.position = this.assignedPosition;
      }
    }
  }

  show() {
    image(this.img, this.position.x, this.position.y, this.width, this.height);
  }

  released() {
    this.dragging = false;
  }

}

function mouseHitTest(position) {

  var mousePosition = new Vector2(mouseX, mouseY);
  var distance = mousePosition.differenceTo(position).magnitude();
  return distance < windowWidth / 18

}

//Loading all images
function preload() {
  loadImages();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  imageMode(CENTER);
  createBox();
}

function draw() {
  //Cleaning background on loop to keep canvas clean
  background(0);
  //Updating box locations and drawing on the screen
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].update();
    boxes[i].show();
  }
  //This is where i'm ordering boxes and making sure they are in the correct assigned positions
  //If i hit a box while dragging a box i make the calculations for ordering
  if (draggedBox >= 0) {

    var box = boxes[draggedBox];
    boxes.forEach(element => {

      if (box === element) {
        return;
      }
      if (mouseHitTest(element.assignedPosition)) {

        if (draggedBox > boxes.indexOf(element)) {
          var elementPos = element.assignedPosition;
          for (i = boxes.indexOf(element); i < draggedBox; i++) {
            boxes[i].assignedPosition = boxes[i + 1].assignedPosition;

          }
          boxes[draggedBox].assignedPosition = elementPos;
        } else {
          var elementPos = element.assignedPosition;
          for (i = boxes.indexOf(element); i > draggedBox; i--) {
            boxes[i].assignedPosition = boxes[i - 1].assignedPosition;
          }
          boxes[draggedBox].assignedPosition = elementPos;
        }
        //Re-setting indexes for correct comparison
        var tempBox = boxes[draggedBox];
        var targetIndex = boxes.indexOf(element);
        boxes.splice(draggedBox, 1);
        boxes.splice(targetIndex, 0, tempBox);
        draggedBox = boxes.indexOf(tempBox);


      }

    })
  }

  //Keeping resize action limited and controlled to block some animation bugs
  if (resizing) {
    for (var i = 0; i < boxes.length; i++) {
      var newPosition = new Vector2(windowWidth / 8 + (i * windowWidth / 8), windowHeight / 2);
      boxes[i].position = newPosition;
      boxes[i].assignedPosition = newPosition;
      boxes[i].width = windowWidth / 10;
      boxes[i].height = windowWidth / 10;
      boxes[i].show();
      resizing = false;
    }
  }
}

//Controlling Mouse pressed function
function mousePressed() {
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].clicked()) {
      draggedBox = i;
    }

  }
}

//Controlling Mouse release function
function mouseReleased() {
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].released();
  }
  draggedBox = -1;
}

//Loading our assets into a list
function loadImages() {
  for (var i = 0; i < 7; i++) {
    images[i] = loadImage('Assets/sq' + i + '.png');
  }
}

//Mixing Images List to create random boxes on every page refresh
function mix(images) {
  var currentIndex = images.length,
    temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = images[currentIndex];
    images[currentIndex] = images[randomIndex];
    images[randomIndex] = temporaryValue;
  }
  return images;
}

//Creating first mixed list of boxes
function createBox() {
  images = mix(images);
  for (var i = 0; i < boxCount; i++) {
    var creatingPositions = new Vector2(windowWidth / 8 + (i * windowWidth / 8), windowHeight / 2);
    boxes[i] = new Box(images[i], creatingPositions);
  }
}

//Controlling Resize for responsive architecture
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resizing = true;
}