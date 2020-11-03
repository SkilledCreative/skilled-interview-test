'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { DynamoDb } = require('jovo-db-dynamodb');
const { AirtableCMS } = require('jovo-cms-airtable');
//const { DashbotAlexa, DashbotGoogleAssistant, DashbotUniversal } = require('jovo-analytics-dashbot');

const responses = require('./util/cms');

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb(),
    new DynamoDb(),
    new AirtableCMS(),
    //new DashbotAlexa(),
    //new DashbotGoogleAssistant(),
    //new DashbotUniversal()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    LAUNCH() {
        if (this.$user.$data && this.$user.$data.FIRST_TIME_USER_FLAG) {
            this.toIntent('ExistingUser');
        } else {
            this.toIntent('NewUser');
        }
    },
    NewUser() {
        const state = 'Introstate';
        this.$user.$data.FIRST_TIME_USER_FLAG = true;
        responses(this).newUserIntro();
        
        this.followUpState(state).ask(this.$speech, this.$reprompt);
    },
    Introstate:{
        FavoriteNumber(){
        if(this.$inputs.num){
            
            let number = parseInt(this.$inputs.num.value);
            if(0<=number&&number<=5)
            {
                this.toIntent("Outro");
            }
            else if(6<=number&&number<=10)
            {
                const state = 'FavoriteNumber';
                let r = Math.floor(Math.random()*10);
                this.$session.$data.randomnum = r;
                responses(this).guessNum(r);
                this.followUpState(state).ask(this.$speech,this.$reprompt);
            }
            else
            {
                const state = "Introstate";
                responses(this).favoriteNumber();
                this.followUpState(state).ask(this.$speech, this.$reprompt);
            }
        }
    }
    
},
FavoriteNumber:{
    GuessYes(){
            const state = "GuessYes";
            responses(this).right();
            this.tell(this.$speech);
        },
    GuessNo(){
        const state = "GuessNo";
        responses(this).wrong();
        this.tell(this.$speech);
    }
        
    
    
},

Outro(){
    const state = "outro";
    responses(this).getOut();
    this.tell(this.$speech);
}
    ,
    ExistingUser() {
        const state = 'Introstate';
        responses(this).existingUserIntro();
        
        this.followUpState(state).ask(this.$speech, this.$reprompt);
    },

    StartOverIntent(){
        const state = 'StartOverState'
        responses(this).startOverIntro();
        this.followUpState(state).ask(this.$speech, this.$reprompt);
    },


    HelpIntent() {
        responses(this).help();
        this.ask(this.$speech, this.$reprompt);
    },

    CancelIntent() {
        responses(this).cancel();
        this.tell(this.$speech);
    },

    Unhandled() {
        responses(this).unhandled();
        this.ask(this.$speech, this.$reprompt);
    },

    FallbackIntent() {
        responses(this).fallback();
        this.ask(this.$speech, this.$reprompt);
    },


    END() {
        responses(this).outro();
        this.tell(this.$speech);
    }
});

module.exports.app = app;
