import '/src/style.css';

//DOM references 
let clearRect:HTMLElement | null = document.getElementById("clearRect");
let blueP:HTMLElement | null = document.getElementById("blueP");
let redP:HTMLElement | null = document.getElementById("redP");
let gameContainer:HTMLElement | null = document.getElementById("gameContainer");
let pStartGame:HTMLElement | null = document.getElementById("pStartGame");
let divStartGame:HTMLElement | null = document.getElementById("divStartGame");
let pReplayMessage:HTMLElement | null = document.getElementById("pReplayMessage");
let rainContainer:HTMLElement | null;

let clickAudio = new Audio("src/sound_effects/click.mp3");

let squaresReference:SquareInterface[] = []; //keeps the reference to all white squares 
let rainArray:rainDrop[] = []; //tracks the existing raindrop's position

let redO:number[] = [], blueX:number[] = [];
// turn = 0 - blue + x
// turn = 1 - red + o

let blueRGBA:number[]= [136,188,216,1], redRGBA:number[] = [255,101,66,1]; //keeping the colors values for use in blink()

let gameEnded:boolean = false; //stops futrthur palaying after the game was won
let shouldRain:boolean = false; //stops the recalling of rain()
let shouldBlink:boolean = false; //stops the recalling of blink()
let canReset:boolean = false; //inicates if the game should allow the player to restart the game

let turn:number = 0; //marks who's trun is it


document.body.onload = ()=>{
  document.body.onkeydown = restart;

  if(pStartGame) pStartGame.onclick = ():void =>{
    startAnimation(0,20,15);
  };
};

function startAnimation(counter:number,width:number,height:number){ 
  //the grow animation of gameContainer and and the creating of the white squares

  if(divStartGame) divStartGame.style.display = "none"; //hides the start word
  
  if(gameContainer){
    gameContainer.style.width = width + "vw";
    gameContainer.style.height = height + "vh";
  }

  height += 0.65;
  width += 0.4;
  counter++;
  if(counter<100){
    setTimeout(()=>{
      startAnimation(counter,width,height);
    },10);
  }
  else{ // initiates the game itself
    createSquares();
    canReset = true;

    setTimeout(()=>{

      if(clearRect) clearRect.style.visibility = "visible";
      if(pReplayMessage) pReplayMessage.style.visibility = "visible";
      
      if(gameContainer){
        gameContainer.style.minHeight = "300px";
        gameContainer.style.minWidth = "300px";
      }
       
    },500);
    setTimeout(()=>{
      chooseSide();
    },1300);
  }
}


function chooseSide():void{
  //randomly selects a color to go first
  blueP?.classList.remove("blueHighlight");
  redP?.classList.remove("redHighlight");

  if(Math.random()<0.5){
    // selects blue
    turn = 0;
    blueP?.classList.add("blueHighlight");
  }
  else{
    //selects red
    turn = 1;
    redP?.classList.add("redHighlight");
  }
}

function markSquare(event:Event):void{
  //reacts when clikced on a white square, places the appropirate picture in the square and checks for wins of draw

  if(!gameEnded && event.target !=null){ // if the game is not over and the refered element is not null

    if(event.target instanceof HTMLDivElement){

      let target = <SquareInterface>event.target;
      clickAudio.play();

      if(!target.marked){ //if the elementn was'nt pressed before

        target.marked = true;
        let tempImg:HTMLImageElement = document.createElement("img");

        if(turn == 0){

          tempImg.src = "./src/images/x.png";
          blueX.push(<number>target.i);

          if(checkForWin(blueX)){ //checks for blue win 
            gameEnded = true;
            shouldBlink = true;
            blueP?.classList.remove("blueHighlight");

            if(blueP) blink(blueP,blueRGBA,false);

            shouldRain = true;
            createRainContainer();
            rain(0,"./src/images/grayX.png","./src/images/blueX.png",10);
          }
          else if(checkForDraw()){ //checks for draw
            blueP?.classList.remove("blueHighlight");
            redP?.classList.remove("redHighlight");

            shouldRain = true;
            createRainContainer();
            rain(0,"./src/images/grayX.png","./src/images/grayO.png",10);
          }
          else{ //continues the game
            turn = 1;
            blueP?.classList.remove("blueHighlight");
            redP?.classList.add("redHighlight");
          }
        }
        else{

          tempImg.src = "./src/images/o.png";
          redO.push(<number>target.i);

          if(checkForWin(redO)){ //checks for the red win
            gameEnded = true;
            shouldBlink = true;
            redP?.classList.remove("redHighlight");

            if(redP)blink(redP,redRGBA,false);

            shouldRain = true;
            createRainContainer();
            rain(0,"./src/images/redO.png","./src/images/grayO.png",10);
          }
          else if(checkForDraw()){ //checks for draw
            blueP?.classList.remove("blueHighlight");
            redP?.classList.remove("redHighlight");

            shouldRain = true;
            createRainContainer();
            rain(0,"./src/images/grayX.png","./src/images/grayO.png",10);
          }
          else{ //continues the game
            turn = 0;
            redP?.classList.remove("redHighlight");
            blueP?.classList.add("blueHighlight");
          }
        }

        target.appendChild(tempImg); //inserts the img into the square
      }
    }
  }
}

function checkForWin(array:number[]):boolean{
  // lists all possible cases of a win, only used due to the little amount of cases and the persistante of them
  
  if(array.length<3) return false;
  
  if(array.includes(0) && array.includes(4) && array.includes(8))
    return true;
  else if(array.includes(2) && array.includes(4) && array.includes(6))
    return true;
  else if(array.includes(0) && array.includes(1) && array.includes(2))
    return true;
  else if(array.includes(3) && array.includes(4) && array.includes(5))
    return true;
  else if(array.includes(6) && array.includes(7) && array.includes(8))
    return true;
  else if(array.includes(0) && array.includes(3) && array.includes(6))
    return true;
  else if(array.includes(1) && array.includes(4) && array.includes(7))
    return true;
  else if(array.includes(2) && array.includes(5) && array.includes(8))
    return true;

  return false;
}

function checkForDraw():boolean{
  //checkks if all the squares are marked to declair draw

  for(let i:number = 0; i<squaresReference.length; i++){
    if(!squaresReference[i].marked) return false;
  }
  return true;
}

function restart(event:KeyboardEvent):void{
  //restarts all varibles and array of the model and reintitiates with new white squares 

  if(event.code == "Space" && canReset){ 
    
    if(clearRect) deleteChildNodes(clearRect); //deleting all the squares to avoid checking whats inside and then empty the content of them
    if(rainContainer) document.body.removeChild(rainContainer);

    if(blueP) blueP.style.backgroundColor = "rgba("+blueRGBA[0]+","+blueRGBA[1]+","+blueRGBA[2]+",0.3)"; //changing the background of both sides to the default
    if(redP) redP.style.backgroundColor = "rgba("+redRGBA[0]+","+redRGBA[1]+","+redRGBA[2]+",0.3)";
    redRGBA[redRGBA.length-1] = 0.3;
    blueRGBA[blueRGBA.length-1] = 0.3;

    gameEnded = false;
    shouldBlink = false;
    shouldRain = false;
    
    squaresReference = [];
    redO = [];
    blueX = [];
    rainArray = [];

    createSquares();
    setTimeout(()=>{
      chooseSide();
    },300); 
  }
}


//all element creating/deleting realated functions
function createSquares() :void {
  //creating and placing the squares in the clearRect

  if(clearRect) clearRect.style.visibility = "visible";

  for(let i:number = 0; i<9; i++){
    let tempSquare:SquareInterface = document.createElement("div");
    tempSquare.className = "square";
    tempSquare.i = i;
    tempSquare.marked = false;
    tempSquare.onclick = markSquare;

    squaresReference.push(tempSquare);
    clearRect?.appendChild(tempSquare);
  }
}

function deleteChildNodes(element:HTMLElement):void{
  //deletes all child nodes of a given element

  if(element.firstChild){
    element.removeChild(element.firstChild);
    deleteChildNodes(element);
  }
}


//all animation related functions
function blink(element:HTMLElement,colorArray:number[], goesUp:boolean):void{
  //resposible for the winner blinking animation, changes the alpha var in the color and restores to the original when it should not run anymore

  if(shouldBlink){
    let alpha = colorArray[colorArray.length -1];
    
    if(goesUp){
      alpha += 0.01;
      colorArray[colorArray.length-1] = alpha;
      if(alpha>1)
        goesUp = false;
    }

    else{
      alpha -= 0.01;
      colorArray[colorArray.length-1] = alpha;
      if(alpha<0.3)
        goesUp = true;
    }

    element.style.backgroundColor = "rgba("+colorArray[0]+","+colorArray[1]+","+colorArray[2]+","+colorArray[3]+")";

    setTimeout(():void=>{
      blink(element,colorArray,goesUp);
    },10);
  }
}

function createRainContainer():void{
  //create the container of the rain drops to easy delete when needed
  rainContainer = document.createElement("div");
  rainContainer.id = "rainContainer";
  document.body.appendChild(rainContainer);
}

function createNewRainRow(img1:string,img2:string,amount:number):void{
  //creates the raindrops elements to the rainContainer

  for(let i:number = 0; i<amount; i++){
    
    let tempElementImg:HTMLImageElement = document.createElement("img");
    tempElementImg.src = Math.random()<0.5 ? img1 : img2;
    tempElementImg.className = "rain";

    let objRainDrop:rainDrop = {
      reference:tempElementImg,
      x:Math.floor((Math.random())*(100/amount))+(100/amount)*i,
      y:-10
    };

    
    if(objRainDrop.x>96)
      objRainDrop.x = 96;

    tempElementImg.style.left = "-10vw"; //making sure they wont pop at the edge of the screen
    tempElementImg.style.top = "-10vh";
    
    rainArray.push(objRainDrop);
    if(rainContainer) rainContainer.appendChild(tempElementImg);
  }
}

function rain(counter:number, img1:string, img2:string, amount:number){
  //maintainning the positions of all raindrops existing 

  if(shouldRain){
    
    for(let i = 0; i<rainArray.length; i++){
      
      rainArray[i].reference.style.left = rainArray[i].x + "vw";
      rainArray[i].reference.style.top = rainArray[i].y + "vh";
      
      rainArray[i].y += 0.05;
      rainArray[i].reference.style.opacity = 1-(rainArray[i].y*0.01)-0.1 +"";
      
      if(rainArray[i].y > 90){ //if a raindrop hit the limit I specified (90vh) it would be removed 
        if(rainContainer) rainContainer.removeChild(rainArray[i].reference);
        rainArray.splice(i,1);
      }
    }
  
    counter++; //tracks one complete second when the page is running to avoid overcreations of raindrops
    if(counter == 200){
      createNewRainRow(img1,img2,amount);
      counter = 0;
    }

    setTimeout(()=>{rain(counter, img1,img2, amount);},1);
  }
}


// interfaces
interface SquareInterface extends HTMLDivElement{ //allows to track the white squares of the DOM better
  i?:number;
  marked?:boolean;
}

interface rainDrop{ //describes the exact position of a raindrop on the screen 
  reference:HTMLImageElement,
  x:number;
  y:number
}
