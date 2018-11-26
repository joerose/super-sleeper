/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

function pluck(arr) {
    const randIndex = Math.floor(Math.random() * arr.length);
    return arr[randIndex];
}

const states {
    TOO_MUCH_CONFIRMATION: "TOO_MUCH_CONFIRMATION"
};

const WellRestedPhrases = {

    tooMuch: [
        "I think you may sleep too much and swing back to tired.",
        "whoa, that's a lot of sleep. You'll wake up rested for sure."
    ],
    justRight: [
        "you should wake up refreshed.",
        "it's clear you know rest is important. Good job, you.",
        "with that much sleep, you're ready to face the world.",
        "you'll wake up invigorated."
    ],
    justUnder: [
        "you may get by, but watch out for a mid-day crash.",
        "you'll be alright, but would be better off with a bit more time.",
        "you may be a little tired tomorrow."
    ],
    tooLittle: [
        "you'll be dragging tomorrow. Get the coffee ready!",
        "that's either a long night or early morning? Either way, tomorrow's going to be rough."
    ]
};

const WellRestedIntentHandler = {
    //All handlers have a canHandle() method that is checked to see if the handler can handle the intent
    canHandle(handlerInput) {
        const intentName = "WellRestedIntent";

        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
               handlerInput.requestEnvelope.request.intent.name === intentName;
    },

    handle(handlerInput) {
        const slots = handlerInput
                        .requestEnvelope
                        .request
                        .intent
                        .slots;

        const numOfHours = slots.NumberOfHours.value;
        let adjustedHours = parseInt(numOfHours);

        const quality = slots.SleepQuality && slots.SleepQuality.value;

        const good = ["good", "well", "wonderfully", "a lot", "amazing", "fantastic", "great", "not bad"];
        const bad = ["bad", "poorly", "little", "very little", "not at all"];

        if (Number.isInteger(adjustedHours)) {

            let speech = "";

            const attributes = handlerInput.attributesManager.getSessionAttributes();

            if (numOfHours > 12) {
                attributes.state = states.TOO_MUCH_CONFIRMATION;

                handlerInput.attributesManager.setSessionAttribute(attributes);

                const speech = "I want to make sure I got that." +
                                "Do you really plan to sleep " +
                                numOfHours + " hours?";
                const reprompt = numOfHours + " hours? Did I hear right?";

                return handlerInput.responseBuilder
                        .speak(speech)
                        .reprompt(reprompt)
                        .getResponse();
            }

            const resolutionValues = slots.SleepQuality &&
                slots.SleepQuality.resolutions &&
                slots.SleepQuality.resolutions.resolutionsPerAuthority[0] &&
                slots.SleepQuality.resolutions.resolutionsPerAuthority[0].values;

            if (resolutionValues) {
                const quality = resolutionValues[0].value.id;

                if (quality === "good") {
                    adjustedHours += 1;
                    speech = "You slept well last night, and ";
                }

                if (quality === "bad") {
                    adjustedHours -= 1;
                    speech = "You slept poorly last night, and ";
                }
            }

            if (adjustedHours > 12) {
                speech += pluck(WellRestedPhrases.tooMuch);
            } else if (adjustedHours > 8) {
                speech += pluck(WellRestedPhrases.justRight);
            } else if (adjustedHours > 6) {
                speech += pluck(WellRestedPhrases.justUnder);
            } else {
                speech += pluck(WellRestedPhrases.tooLittle);
            }

            return handlerInput
                    .responseBuilder
                    .speak(speech)
                    .getResponse();
       } else {

            console.log("Slot values ", slots);

            const speech = "Oh, I don't know what happened. Tell me again. " +
                            "How many hours will you sleep tonight?";
            const reprompt = "How many hours are you going to sleep tonight?";

            return handlerInput
                    .responseBuilder
                    .speak(speech)
                    .reprompt(reprompt)
                    .getResponse();
        }
    }
};

const StopOrCancelIntentHandler = {

    canHandle(handlerInput) {
        const stopIntentName = "AMAZON.StopIntent";
        const cancelIntentName = "AMAZON.CancelIntent";

        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            (handlerInput.requestEnvelope.request.intent.name === stopIntentName ||
            handlerInput.requestEnvelope.request.intent.name === cancelIntentName);
    },

    handle(handlerInput) {
        const speech = "Alright, see you around and sleep well.";

        return handlerInput
                .responseBuilder
                .speak(speech)
                .getResponse();
    }
};

const LaunchRequestHandler = {

    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },

    handle(handlerInput) {
        const speech = "Welcome to the Super Sleeper skill. You can ask for " +
                        "how well rested you'll be or tell me how you slept.";
        const reprompt = "Try saying 'I slept well last night.'";

        return handlerInput
                .responseBuilder
                .speak(speech)
                .reprompt(reprompt)
                .getResponse();
    }

};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
                    .addRequestHandlers(
                        WellRestedIntentHandler,
                        StopOrCancelIntentHandler,
                        LaunchRequestHandler
                    )
                    .lambda();