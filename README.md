# Jovo Starter Repo

## Example Airtable Row

| ID | Copy Text | Screen | Backup Screen | Copy Audio | Description | Notes
|--|--| -- | -- |--|--| -- |
| A1 | Welcome {name} | screen.json | backup.json | A1.mp3 | FTUE | notes...

## Notes
- **ID**:
-This is the module ID referenced in the code
 - **Copy Text**: 
 -Use {parameterName} for dynamic tts (this uses the VOparams object in cms.js) 
   
 - **Screen, Backup Screen, Copy Audio**: 
 -Insert JUST the file name, code will parse relative whatever base you put in cms.constants.js
 
 - **Description, Notes**: 
 -This is just for the creative team, not pulled down into the code at all
