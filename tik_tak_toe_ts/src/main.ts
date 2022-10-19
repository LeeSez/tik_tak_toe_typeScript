import '/src/style.css';

let clearRect:HTMLElement | null,blueP:HTMLElement | null, redP:HTMLElement | null;
let gameContainer:HTMLElement | null, rainContainer:HTMLElement | null;
//let pStartGame:HTMLElement | null, divStartGame:HTMLElement | null, pReplayMessage:HTMLElement | null;

let clickAudio = new Audio("src/sound_effects/click.mp3");

let squaresReference:SquareClass[] = []; 
let rainArray:rainDrop[] = []; 

let redO:number[] = [], blueX:number[] = [];
// turn = 0 - blue + x
// turn = 1 - red + o

let blueRGBA:number[]= [136,188,216,1], redRGBA:number[] = [255,101,66,1]; 

let gameEnded:boolean = false; 
let shouldRain:boolean = false; 
let shouldBlink:boolean = false; 

let turn:number = 0; 



document.body.onload = ()=>{

  document.body.onkeydown = restart;

  clearRect = document.getElementById("clearRect");
  gameContainer = document.getElementById("gameContainer");
  redP = document.getElementById("redP");
  blueP = document.getElementById("blueP");
  /*pStartGame = document.getElementById("pStartGame");
  divStartGame = document.getElementById("divStartGame");
  pReplayMessage = document.getElementById("pReplayMessage");*/

  createSquares();
  chooseSide();
};

function chooseSide():void{

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

  if(!gameEnded && event.target !=null){ // if the game is not over and the refered element is not null

    if(event.target instanceof HTMLDivElement){ //doesnt let me use SquareClass for some reason!

      let target = <SquareClass>event.target;
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
  for(let i:number = 0; i<squaresReference.length; i++){
    if(!squaresReference[i].marked) return false;
  }
  return true;
}

function restart(event:KeyboardEvent):void{

  if(event.keyCode == 32){ //keycode is deprecated
    
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
    
    if(clearRect) deleteChildNodes(clearRect); //deleting all the squares to avoid checking whats inside and then empty the content of them

    if(rainContainer) document.body.removeChild(rainContainer);

    createSquares();
    chooseSide();
  }
}


//all element creating/deleting realated functions
function createSquares() :void {
  
  if(clearRect) clearRect.style.visibility = "visible";

  for(let i:number = 0; i<9; i++){
    let tempSquare:SquareClass = document.createElement("div");
    tempSquare.className = "square";
    tempSquare.i = i;
    tempSquare.marked = false;
    tempSquare.onclick = markSquare;

    squaresReference.push(tempSquare);
    clearRect?.appendChild(tempSquare);
  }
}

function deleteChildNodes(element:HTMLElement):void{
  if(element.firstChild){
    element.removeChild(element.firstChild);
    deleteChildNodes(element);
  }
}


//all animation related functions
function blink(element:HTMLElement,colorArray:number[], goesUp:boolean):void{

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


// classes & interfaces
class SquareClass extends HTMLDivElement{
  i?:number;
  marked?:boolean;
}

interface rainDrop{
  reference:HTMLImageElement,
  x:number;
  y:number
}
