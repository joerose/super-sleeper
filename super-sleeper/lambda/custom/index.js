
const Alexa = require("alexa-sdk");

const states = {

	TOO_MUCH: '_TOO_MUCH'
};

const handlers = {

	"AMAZON.StopIntent" () {
		this.emit(":tell", "Alright. See you around. Sleep well.");
	},
	"AMAZON.HelpIntent" () {
	
		const response = "You can ask Super Sleeper how well rested you'll be or " +
						 "share how well you slept the night before. Try saying " +
						 "'I slept well last night.'"; 
		const reprompt = "You can also say, 'How well rested will I be sleeping " +
						 "8 hours.'";
						 
		this.emit(":ask", response, reprompt);
	},
	"AMAZON.CancelIntent" () {
		this.emit("AMAZON.StopIntent");
	},
	
	LaunchRequest () {
		
		const response = "Welcome to the Super Sleeper skill. You can ask for " +
						 "how well rested you'll be or tell me how you slept.";
		const reprompt = "Try saying 'I slept well last night.'";
		
		this.emit(':ask', response, reprompt);  
	
	},

	WellRestedIntent () {
	
		const slotValue = this.event.request.intent.slots.NumberOfHours.value;
		const numOfHours = parseInt(slotValue);
		
		if (Number.isInteger(numOfHours)) {
		
			let speech;
			if (numOfHours > 12) {
				speech = "I think you may sleep too much and swing back to tired.";
			} else if(numOfHours > 8) {
				speech = "You should wake up refreshed.";
			} else if (numOfHours > 6) {
				speech = "You may get by, but watch out for a mid-day crash.";
			} else {
				speech = "You'll be dragging tomorrow. Get the coffee ready!";
			}
			
			this.emit(":tell", speech);
		} else {
			
			console.log(`Slot value: ${slotValue}`);
			
			const prompt = "I'm sorry, I heard something that doesn't seem like" + 
							 " a number. How many hours of sleep do you want?";
			const reprompt = "Tell me how many hours you plan to sleep."; 
			
			this.emit(":ask", prompt, reprompt);
		}
		
	},
	
	SleepQualityIntent() {
		//this.emit(":tell", "Sleep quality intent!");
		
		// const quality = this.event.intent.slots.PreviousNightQuality.value;
		const values = this.event.request.intent.slots.PreviousNightQuality.resolutions.resolutionsPerAuthority[0].values;
		
		// const good = ["good", "well", "wonderfully", "a lot", "amazing", "fantastic", "o.k.", "great"];
		// const bad = ["bad", "poorly", "little", "very little", "not at all", "horribly"];
		
		let speech;
		
		// if (good.includes(quality)) {
		//	speech = "Let's keep the great sleep going!";		
		// } else if (bad.includes(quality)) {
		// 	speech = "I hope tonight is better for you.";
		//} else {
		//  	speech = "I've got a good feeling about your sleep tonight";
		//}
		
		if (values) {
		
			const quality = values[0].value.id;
		
			if (quality === 'good') {
				speech = "Let's keep the great sleep going!";
			} else if (quality === 'bad') {
				speech = "I hope tonight is better for you.";
			} else {
				speech = "I've got a good feeling about your sleep tonight";
			}
		} else {
			speech = "I think you're going to sleep well tonight";
		}
		
		this.emit(":tell", speech);
	}

};

exports.handler = function(event, context, callback) {

	const alexa = Alexa.handler(event, context, callback);
	
	alexa.appId = "amzn1.ask.skill.52683aeb-c838-4109-bfe7-a030724634f7";
	
	alexa.registerHandlers(handlers);
	alexa.execute();
	
};