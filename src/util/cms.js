const format = require('string-format')

const CONSTANTS = require('./cms.constants');

const {
    exampleEvent
} = require('./dashbot');

const {
    List,
    OptionItem
} = require('jovo-platform-googleassistant');


const responses = (jovo) => {

    /* Handles the text-to-speech portion
     * @param {String} row current cms row
     * @param {Jovo.SpeechBuilder} sb allows adding to prompt sb or reprompt sb
     * @param {Object} params VOparams to insert into tts string
     */
    const addToSpeechBuilder = (row, sb, params) => {
        const text = format(row[1], params);
        if (row[2]) {
            const speechAudio = CONSTANTS.AUDIO_BASE_URL + row[2];
            if (jovo.getPlatformType() === 'GoogleAssistant') {
                sb.addAudio(speechAudio, text);
            } else if (jovo.getPlatformType() === 'Alexa') {
                sb.addAudio(speechAudio);
            }
        } else {
            sb.addText(text);
        }
    }
    /**
     * base level function for CMS interaction
     * @param {string} mod Module ID 
     * @param {Object} params VOparams object gets formated into the CMS string
     * APLparams object gets appended to the APL datasource (NO IMPLEMENTATION FOR GOOGLE YET)
     */
    const addToResponse = (mod, {VOparams, VisualParams} = {}) => {
        const rowFinder = (response, reprompt) => {
            let moduleID = mod;
            if (reprompt === true) moduleID += '_reprompt';
            return response[0].trim() === moduleID;
        }

        const repromptFinder = (response) => {
            return rowFinder(response, true);
        }

        const platformFinder = (response, reprompt) => {
            let moduleID = mod + (jovo.isAlexaSkill() ? '_Alexa' : '_Google');
            if (reprompt === true) moduleID += '_reprompt';
            return response[0].trim() === moduleID;
        }

        const platformReprompt = (response) => {
            return platformFinder(response, true)
        }

        console.log('ADDING TO RESPONSE: ', mod);
        
        let prompt = jovo.$cms.responses.find(platformFinder);

        let reprompt = jovo.$cms.responses.find(platformReprompt);

        if (!prompt) {
            // Finds row that matches {mod}
            prompt = jovo.$cms.responses.find(rowFinder);
            // Finds row that matches {mod}_reprompt
            reprompt = jovo.$cms.responses.find(repromptFinder)
        }
        

        addToSpeechBuilder(prompt, jovo.$speech, VOparams);
        addToSpeechBuilder(reprompt || prompt, jovo.$reprompt, VOparams);

        const screen = prompt[3];
        const backUpScreen = prompt[4];
        if (screen) setVisuals(screen, backUpScreen, VisualParams);
    }

    const setVisuals = (screen, backUpScreen, params) => {
        if (jovo.getPlatformType() === 'GoogleAssistant') {
            setGoogleVisuals(screen, backUpScreen, params);
        } else if (jovo.getPlatformType() === 'Alexa') {
            setAPL(screen, backUpScreen, params);
        }
    }

    const setAPL = (screen, backUpScreen, params) => {

        const genericCard = () => {
            jovo.$alexaSkill.showStandardCard(
                CONSTANTS.MOBILE_TITLE, 
                CONSTANTS.MOBILE_BODY, {
                smallImageUrl: CONSTANTS.SMALL_MOBILE,
                largeImageUrl: CONSTANTS.LARGE_MOBILE,
            });
        }

        const interfaces = jovo.$alexaSkill.$request.context.System.device.supportedInterfaces;
        if (interfaces['Alexa.Presentation.APL']){
            let file;
            try {
                file = JSON.stringify(require(`../apl/${screen}`));
            } catch(err) {
                try {
                    file = JSON.stringify(require(`../apl/${backUpScreen}`));
                } catch(err) {
                    genericCard();
                    return;
                }
            }
            const {document, datasources} = JSON.parse(file);
            
            jovo.$alexaSkill.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document,
                datasources: {
                    ...datasources,
                    params: {
                        type: "object",
                        objectId: "params",
                        properties: params
                    }
                }
            });
            
        } else {
            genericCard();
        }
    }

    const setGoogleVisuals = (screen, backUpScreen, params) => {

        const genericCard = () => {}

        if (jovo.hasScreenInterface()){
            let file;
            try {
                file = JSON.stringify(require(`../googleVisuals/${screen}`));
            } catch(err) {
                try {
                    file = JSON.stringify(require(`../googleVisuals/${backUpScreen}`));
                } catch(err) {
                    genericCard();
                    return;
                }
            }
            const {type, src} = JSON.parse(file);
            // Creates the corresponding Google Visual Object from the provided JSON
            // Only List and SuggestionChips are implemented, but the pattern can be 
            // extended to cover more
            const outputMap = {
                List: () => {
                    const list = new List();
                    list.setTitle(src.title);
                    src.items.forEach(item => {
                        list.addItem(
                            (new OptionItem())
                                .setTitle(item.title)
                                .setImage({
                                    url: item.img,
                                    accessibilityText: item.title})
                                .setKey(item.key)
                        )
                    });
                    jovo.$googleAction.showList(list);
                },
                SuggestionChips: () => 
                    jovo.$googleAction.showSuggestionChips(src.suggestions)
            };
            outputMap[type]();
        } else {
            genericCard();
        }
    }

    // Basic Example: single module response
    const introduction = () => addToResponse('A1');
    
    // Example of using multiple modules in one response
    const multiple = () => {
        addToResponse('B2c');
        addToResponse('B3');
    }
    
    // Example of using Visual or Voice Over parameters
    const withParams = (zip) => addToResponse('B6', {
        APLparams: {
            bodyText: `Is ${zip} correct?`
        },
        VOparams: {
            zipcode: zip
        }
    });
    const guessNum = (_rand) => addToResponse('C1',{
        VOparams: {
            rand: _rand
        }
    })
    // Example recording custom Analytics event with Dashbot
    const analytics = async () => {
        addToResponse('B1');
        await exampleEvent('Read out B1!');
    }
    
    // Generic Responses
    const wrong = () => {addToResponse('C3'); getOut();}
    const right = () => {addToResponse('C2'); getOut();}
    const getOut = () => addToResponse('O1');
    const newUserIntro = () => {addToResponse('A1'); favoriteNumber();}
    const favoriteNumber = () => addToResponse('B1');
    const existingUserIntro = () => {addToResponse('A2'); favoriteNumber();}
    const startOverIntro = () => addToResponse('A3');

    const help = () => addToResponse("HELP")
    const cancel = () => addToResponse("CANCEL")
    const fallback = () => addToResponse("FALLBACK")
    const unhandled = () => addToResponse("UNHANDLED")
    const end = () => addToResponse('EXIT')
    
    // I don't really like this, but adding all of the 
    // cms functions to an inline object to return 
    // doesn't allow for re-use/modularity of responses
    return {
        help,
        cancel,
        fallback,
        unhandled,
        end,
        withParams,
        multiple,
        introduction,
        setVisuals,
        analytics,
        newUserIntro,
        existingUserIntro,
        startOverIntro,
        favoriteNumber,
        getOut,
        guessNum,
        wrong,
        right
    }
   
}

module.exports = responses;