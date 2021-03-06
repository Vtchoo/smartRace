var $ = function(id){return document.getElementById(id)};

//var pista
var startX 
var startY
var phase = "drawing"

var nnLayers = 1
var nnNeurons = 20
var nnInputs = 8
var nnOutputs = 2
var nnRange = 4
var nnMutationRate = 0.01
var nnActivation = "softsign"
var population = 30
var offs = 3
var breedingMode = "best"

var cars = []
var nets = []
var newOffspring = []
var newOffspringPaint = []
var newOffspringReplace = []

var carSprite 

var renderTrack
var drawingMode = true
var showInputs = false

var tick = 0
var maxticks = 500
var gen = 0

function setup(){

	//frameRate(30)

	createCanvas(screen.width*0.8, screen.height*0.8)
	renderTrack = createGraphics(canvas.width, canvas.height)

	background("green")

	carSprite = loadImage("./images/car.png")
	carSprite.resize(20, 10)
}

function draw(){

	switch (phase){
		
		case "drawing":
			renderTrack.push();
			if (mouseIsPressed){
				renderTrack.strokeWeight(50);
				renderTrack.line(pmouseX,pmouseY,mouseX,mouseY);
			}
			renderTrack.pop();
			image(renderTrack,0,0)
			break

		case "setStart":
			push()
			background("green")
			image(renderTrack, 0, 0)
			imageMode(CENTER)
			carSprite.resize(20, 10)
			image(carSprite, mouseX, mouseY)
			pop()
			break

		case "setDirection":
			push()
			background("green")
			image(renderTrack, 0, 0)
			pop()

			push()
			imageMode(CENTER)
			translate(startX,startY);
			rotate(createVector(mouseX - startX, mouseY - startY).heading())
			carSprite.resize(20, 10)
			image(carSprite, 0, 0)
			pop()
			break

		case "setup":

			for (var k = 0 ; k < population ; k++){
				cars[k] = new car()
				nets[k] = new neuralNet(nnLayers, nnNeurons, nnInputs, nnOutputs, nnRange, nnMutationRate, nnActivation)
			}

			phase = "running"
			break

		case "running":

			if (tick < maxticks){
				clear()
				background("green")
				image(renderTrack, 0, 0)

				for (var l = 0 ; l < population ; l++){
					cars[l].drive(nets[l].output(cars[l].getinputs(renderTrack)))
					cars[l].update()
					cars[l].show()
					nets[l].addfitness(cars[l].vel.mag()) 
				}

				tick++
			} else {
				phase = "breeding"
			}
			break

		case "breeding":

			//console.log(getFitness(1, nets))
			//console.log(getFitness(2, nets))
			//console.log(getFitness(population, nets))
			//console.log(getFitness(population - 1, nets))
			//console.log(getFitness(population - 2, nets))
			

			for (var m = 0 ; m < offs ; m++){
				parent1 = getFitness(1 + 2*m, nets)[0]
				parent2 = getFitness(2 + 2*m, nets)[0]
				console.log(parent1)
				console.log(parent2)
				newOffspring[m] = new offspring(nets[parent1], nets[parent2])
				newOffspring[m].fitness = Infinity
				newOffspringPaint[m] = [int((sqrt((sq(cars[parent1].paintRGB[0])+sq(cars[parent2].paintRGB[0]))/2)+10*(Math.round(Math.random()) * 2 - 1)*nnMutationRate*255)%255), 
										int((sqrt((sq(cars[parent1].paintRGB[1])+sq(cars[parent2].paintRGB[1]))/2)+10*(Math.round(Math.random()) * 2 - 1)*nnMutationRate*255)%255), 
								    	int((sqrt((sq(cars[parent1].paintRGB[2])+sq(cars[parent2].paintRGB[2]))/2)+10*(Math.round(Math.random()) * 2 - 1)*nnMutationRate*255)%255)]
				newOffspringReplace[m] = getFitness(population - m, nets)[0]
			}

			for (var m = 0 ; m < offs ; m++){

				nets[newOffspringReplace[m]] = newOffspring[m]
				cars[newOffspringReplace[m]].paintRGB = newOffspringPaint[m]
				
			}

			nets[getFitness(population, nets)[0]].mutate()
			nets[getFitness(population - 1, nets)[0]].mutate()

			for (var m = 0; m < population; m++){
				nets[m].resetfitness()
				cars[m].pos = createVector(startX + Math.random(-0.5, .5), startY + Math.random(-0.5, .5))
				cars[m].vel = createVector(.0001*Math.cos(initialHeading), .0001*Math.sin(initialHeading));
			}

			tick = 0
			gen++
			phase = "running"
			break
	}


}

function car(){

	this.paintRGB = [int(Math.random()*255), int(Math.random()*255), int(Math.random()*255)]
	this.paint = "rgb("+this.paintRGB[0]+","+this.paintRGB[1]+","+this.paintRGB[2]+")"

	this.pos = createVector(startX,startY);
	this.vel = createVector(.0001*Math.cos(initialHeading), .0001*Math.sin(initialHeading));
	//this.acc = createVector();
	this.multiplier = 0

	this.update = function(){
		//this.vel.add(this.acc);

		if (renderTrack.get(this.pos.x,this.pos.y)[3] != 255 || renderTrack.get(this.pos.x,this.pos.y)[3] == null){
			this.vel.setMag(this.vel.mag()*0.01)
		}

		this.pos.add(this.vel);
		//this.acc.mult(0);
	}

	this.show = function(){
		push();
		translate(this.pos.x,this.pos.y);
		rotate(this.vel.heading());
		//rectMode(CENTER);
		//rect(0,0,15,9);
		imageMode(CENTER)
		carSprite.resize(20, 10)
		tint(this.paint)
		image(carSprite,0,0)
		pop();
	}

	this.drive = function(input){

		this.multiplier = this.vel.mag()/(2 + this.vel.mag())

		if (input[0] >= 0) {
			this.vel.add(createVector(Math.cos(this.vel.heading())*.05,Math.sin(this.vel.heading())*.05))
		} else if (input[0] < 0) {
			if (Math.pow(this.vel.x,2) + Math.pow(this.vel.y,2) > 0.2) {
				this.vel.add(createVector(-Math.cos(this.vel.heading())*.2,-Math.sin(this.vel.heading())*.2))
			}
		}
		
		this.vel.add(createVector(Math.sin(this.vel.heading())*.1*input[1]*this.multiplier,-Math.cos(this.vel.heading())*.1*input[1]*this.multiplier));
		
	}

	this.getinputs = function(layer){
		var position = this.pos
		var direction = this.vel.heading()

		inp = new Array(8).fill(0)

		inp[7] = this.vel.mag()
		
		for (i = 0 ; i < 7 ; i++){

			angle = direction + ((i-3)/10)*PI
			
			for (j = 0 ; j < 30 ; j++){

				prevx = this.pos.x + (0 + 2*Math.cos(((i-3)/10)*PI))*j*Math.cos(angle)*4
				prevy = this.pos.y + (0 + 2*Math.cos(((i-3)/10)*PI))*j*Math.sin(angle)*4

				x = this.pos.x + (0 + 2*Math.cos(((i-3)/10)*PI))*(j+1)*Math.cos(angle)*4
				y = this.pos.y + (0 + 2*Math.cos(((i-3)/10)*PI))*(j+1)*Math.sin(angle)*4

				if (renderTrack.get(prevx,prevy)[3] != renderTrack.get(x,y)[3]){ 
					//console.log("teste")
					x = this.pos.x + (0 + 2*Math.cos(((i-3)/10)*PI))*(j)*Math.cos(angle)*4
					y = this.pos.y + (0 + 2*Math.cos(((i-3)/10)*PI))*(j)*Math.sin(angle)*4

					break 
				}

				if (renderTrack.get(this.pos.x,this.pos.y)[3] != 255){
						inp[i] = -Math.sqrt( Math.pow(x - this.pos.x, 2) + Math.pow(y - this.pos.y, 2) )
						stroke(255,0,0,50)
					} else {
						inp[i] = Math.sqrt( Math.pow(x - this.pos.x, 2) + Math.pow(y - this.pos.y, 2) )
						stroke(255)
					}

				//inp[i] = Math.sqrt( Math.pow(x - this.pos.x, 2) + Math.pow(y - this.pos.y, 2) )

			}
			
			if (showInputs){ line(this.pos.x, this.pos.y, x, y) }
			
		}

		return inp
	}
	
}

var drawingMode = $('drawing-mode');

drawingMode.onclick = function() {
	switch(phase){
		case "drawing":
			drawingMode.innerHTML = 'Done'
			phase = "setStart"
			break
		case "setDirection":
			phase = "setup"
			break
	}
}

canvas.onclick = function(){
	switch(phase){
		case "setStart":

			renderTrack.loadPixels()

			startX = mouseX
			startY = mouseY

			phase = "setDirection"
			break
		case "setDirection":
			initialHeading = createVector(mouseX - startX, mouseY - startY).heading()
			phase = "setup"
			break
		
	}
}
