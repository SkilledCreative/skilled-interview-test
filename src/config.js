// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    logging: true,
 
    intentMap: {
       'AMAZON.StopIntent': 'END',
       'AMAZON.YesIntent': 'YesIntent',
       'AMAZON.NoIntent': 'NoIntent',
       'AMAZON.FallbackIntent': 'FallbackIntent',
       'AMAZON.CancelIntent': 'CancelIntent',
       'AMAZON.NextIntent': 'NextIntent',
       'AMAZON.StartOverIntent': "RestartIntent",
       'AMAZON.HelpIntent': 'HelpIntent',
       'AMAZON.PauseIntent': 'PauseIntent',
       'AMAZON.ResumeIntent': 'ResumeIntent',
       'AMAZON.PreviousIntent': 'PreviousIntent'
    },

    intentsToSkipUnhandled: [
        'AMAZON.HelpIntent',
        'AMAZON.CancelIntent',
        'AMAZON.StopIntent',
        'StopIntent',
        'CancelIntent',
        'HelpIntent',
        'END'
    ],
 
    db: {
         FileDb: {
             pathToFile: '../db/db.json',
         },
         DynamoDb: {
            tableName: '<key>',
        },
     },
     cms: {
        AirtableCMS: {
            apiKey: 'keyVOd2uFNQqFlRNq',
            baseId: 'appCpCb7a9GxCdgoU',
            tables: [
                {
                    name: 'responses',
                    table: 'CMS',
                    order: ["ID", "Copy Text", "Copy Audio", "Screen", "Backup Screen"],
                    selectOptions: {
                        fields: ["ID", "Copy Text", "Copy Audio", "Screen", "Backup Screen"],
                        sort: [
                            {
                                field: "ID",
                                direction: "desc"
                            }
                        ],
                    }
                }
            ]
        }
    },
    analytics: {
        DashbotAlexa: {
            key: '<key>',
        },
        DashbotGoogleAssistant: {
            key: '<key>',
        },
        DashbotUniversal: {
            key: '<key>',
        },
    },
 };
 