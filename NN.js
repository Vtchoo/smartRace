function neuralNet(layers, neurons, inputs, outputs, range, mutationRate, activation){
	
	console.log("It works")
	
	this.range = range
	this.layers = layers
	this.neurons = neurons
	this.inputs = inputs
	this.outputs = outputs
	this.activation = activation
	this.mutationRate = mutationRate

	this.fitness = 0

	if ( layers == 0 ){
		console.log("Your neural net must have at least 1 neuron layer")
		return 0
	}

	this.weights = []

	for ( i = 0 ; i < layers + 1 ; i++ ){

		this.weights[this.weights.length] = []

		if ( i == 0 ){                      // Create the first weights, from the input values to the first layer

			for ( j = 0 ; j < inputs*neurons ; j++){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * range }

		}else if( i == layers ){            // Create the last weights, from the last layer to the output values

			for ( j = 0 ; j < outputs*neurons ; j++){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * range }

		}else{								// Create the weights between hidden neuron layers

			for ( j = 0 ; j < neurons*neurons ; j++){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * range }
		}
		
	}
	//console.log(this.weights)


	// Generates an output array from the given inputs
	this.output = function(input){

		//console.log(input)

		this.neuronLayer = new Array(this.neurons).fill(0)
		this.neuronLayerPrev = new Array(this.neurons).fill(0)
		this.outputArray = new Array(this.outputs).fill(0)

		for ( i = 0 ; i < this.layers + 1 ; i++ ){

			this.neuronLayer.fill(0)
			//console.log(this.neuronLayer)
			//console.log(this.neuronLayerPrev)

			if ( i == 0 ){                      //

				for ( j = 0 ; j < this.neurons ; j++){
					for (k = 0 ; k < this.inputs ; k++){
						this.neuronLayer[j] = this.neuronLayer[j] + input[k]*this.weights[i][j + k*this.neurons]
					}
					this.neuronLayer[j] = activate(this.neuronLayer[j], this.activation)
					this.neuronLayerPrev[j] = this.neuronLayer[j]
				}

			}else if( i == this.layers ){            // 

				for ( j = 0 ; j < this.outputs ; j++){
					for (k = 0 ; k < this.neurons ; k++){
						this.outputArray[j] = this.outputArray[j] + this.neuronLayerPrev[k]*this.weights[i][j + k*this.outputs]
					}
					this.outputArray[j] = activate(this.outputArray[j], this.activation)
				}

			}else{								// 

				for ( j = 0 ; j < this.neurons ; j++){
					for (k = 0 ; k < this.neurons ; k++){
						this.neuronLayer[j] = this.neuronLayer[j] + this.neuronLayerPrev[k]*this.weights[i][j + k*this.neurons]
					}
					this.neuronLayer[j] = activate(this.neuronLayer[j], this.activation)
					this.neuronLayerPrev[j] = this.neuronLayer[j]
				}
			}
			
			//if( i != this.layers){
			//	console.log(this.neuronLayer)
			//	console.log(this.neuronLayerPrev)
			//}
			
		}

		//console.log(this.outputArray)
		return this.outputArray
	}

	this.addfitness = function(value){
		this.fitness = this.fitness + value
	}

	this.resetfitness = function(){
		this.fitness = 0
	}

	this.mutate = function(){

		for ( i = 0 ; i < this.layers + 1 ; i++ ){

			if ( i == 0 ){                      // Mutate the first weights, from the input values to the first layer

				for ( j = 0 ; j < this.inputs*this.neurons ; j++){
					if (Math.random() < this.mutationRate){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range }
				}

			}else if( i == this.layers ){            // Create the last weights, from the last layer to the output values

				for ( j = 0 ; j < this.outputs*this.neurons ; j++){ 
					if (Math.random() < this.mutationRate){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range }
				}

			}else{								// Create the weights between hidden neuron layers

				for ( j = 0 ; j < this.neurons*this.neurons ; j++){ 
					if (Math.random() < this.mutationRate){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range }
				}
			}	
		}
	}

}

function activate(value, activation){

	switch (activation){
		case "identity":
			return value
		case "binary":
			if ( value > 0 ){
				return 1
			} else {
				return 0
			}
		case "softsign":
			return value / (1 + Math.abs(value))
		case "relu":
			if (value < 0) {
				return 0
			} else {
				return value
			}
		default:
			console.log("No valid activation function selected")
			return value
	}

}

function offspring(parent1, parent2){

	if (parent1.range != parent2.range || parent1.layers != parent2.layers || parent1.neurons != parent2.neurons || parent1.inputs != parent2.inputs || parent1.outputs != parent2.outputs || parent1.activation != parent2.activation){
		console.log("Can't breed these 2 individuals")
	}

	this.range = parent1.range
	this.layers = parent1.layers
	this.neurons = parent1.neurons
	this.inputs = parent1.inputs
	this.outputs = parent1.outputs
	this.activation = parent1.activation
	this.mutationRate = parent1.mutationRate

	this.weights = []

	for ( i = 0 ; i < this.layers + 1 ; i++ ){

		this.weights[this.weights.length] = []

		if ( i == 0 ){                      // Create the first weights, from the input values to the first layer

			for ( j = 0 ; j < this.inputs*this.neurons ; j++){
				if (Math.random() > this.mutationRate){
					if (Math.random() > 0.5){ 
						this.weights[i][j] = parent1.weights[i][j]
					} else {
						this.weights[i][j] = parent2.weights[i][j]
					}
				} else {
					this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range
				}
			}

		}else if( i == this.layers ){            // Create the last weights, from the last layer to the output values

			for ( j = 0 ; j < this.outputs*this.neurons ; j++){ 
				if (Math.random() > this.mutationRate){
					if (Math.random() > 0.5){ 
						this.weights[i][j] = parent1.weights[i][j]
					} else {
						this.weights[i][j] = parent2.weights[i][j]
					}
				} else {
					this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range
				}
			}

		}else{								// Create the weights between hidden neuron layers

			for ( j = 0 ; j < this.neurons*this.neurons ; j++){ 
				if (Math.random() > this.mutationRate){
					if (Math.random() > 0.5){ 
						this.weights[i][j] = parent1.weights[i][j]
					} else {
						this.weights[i][j] = parent2.weights[i][j]
					}
				} else {
					this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range
				}
			}
		}	
	}

	// Generates an output array from the given inputs
	this.output = function(input){

		//console.log(input)

		this.neuronLayer = new Array(this.neurons).fill(0)
		this.neuronLayerPrev = new Array(this.neurons).fill(0)
		this.outputArray = new Array(this.outputs).fill(0)

		for ( i = 0 ; i < this.layers + 1 ; i++ ){

			this.neuronLayer.fill(0)
			//console.log(this.neuronLayer)
			//console.log(this.neuronLayerPrev)

			if ( i == 0 ){                      //

				for ( j = 0 ; j < this.neurons ; j++){
					for (k = 0 ; k < this.inputs ; k++){
						this.neuronLayer[j] = this.neuronLayer[j] + input[k]*this.weights[i][j + k*this.neurons]
					}
					this.neuronLayer[j] = activate(this.neuronLayer[j], this.activation)
					this.neuronLayerPrev[j] = this.neuronLayer[j]
				}

			}else if( i == this.layers ){            // 

				for ( j = 0 ; j < this.outputs ; j++){
					for (k = 0 ; k < this.neurons ; k++){
						this.outputArray[j] = this.outputArray[j] + this.neuronLayerPrev[k]*this.weights[i][j + k*this.outputs]
					}
					this.outputArray[j] = activate(this.outputArray[j], this.activation)
				}

			}else{								// 

				for ( j = 0 ; j < this.neurons ; j++){
					for (k = 0 ; k < this.neurons ; k++){
						this.neuronLayer[j] = this.neuronLayer[j] + this.neuronLayerPrev[k]*this.weights[i][j + k*this.neurons]
					}
					this.neuronLayer[j] = activate(this.neuronLayer[j], this.activation)
					this.neuronLayerPrev[j] = this.neuronLayer[j]
				}
			}
			
			//if( i != this.layers){
			//	console.log(this.neuronLayer)
			//	console.log(this.neuronLayerPrev)
			//}
			
		}

		//console.log(this.outputArray)
		return this.outputArray
	}

	this.addfitness = function(value){
		this.fitness = this.fitness + value
	}

	this.resetfitness = function(){
		this.fitness = 0
	}

	this.mutate = function(){

		for ( i = 0 ; i < this.layers + 1 ; i++ ){

			if ( i == 0 ){                      // Mutate the first weights, from the input values to the first layer

				for ( j = 0 ; j < this.inputs*this.neurons ; j++){
					if (Math.random() < this.mutationRate){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range }
				}

			}else if( i == this.layers ){            // Create the last weights, from the last layer to the output values

				for ( j = 0 ; j < this.outputs*this.neurons ; j++){ 
					if (Math.random() < this.mutationRate){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range }
				}

			}else{								// Create the weights between hidden neuron layers

				for ( j = 0 ; j < this.neurons*this.neurons ; j++){ 
					if (Math.random() < this.mutationRate){ this.weights[i][j] = (Math.random() - (1/2)) * 2 * this.range }
				}
			}	
		}
	}
}

function getFitness(n, population){

	var count = 0

	for (var a = 0 ; a < population.length ; a ++){
		for (var b = 0 ; b < population.length ; b++){
			if ( population[a].fitness >= population[b].fitness ) { count++ }
		}

		if ( count == population.length - n + 1 ) { return [a, population[a].fitness] }
	}


}