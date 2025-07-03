let myObject = {
     'name' : 'Flo',
     'age' : 45, 
     'good_guy': true,
     'job': function(number){
        console.log('Dev-Mentor');
        // Metoden === function in Object //
     },
};

// Anzeigen einzelner Objecte: //
// Es gibt zwei Notationen //
console.log(myObject.age);

console.log(myObject['age']);

// let objKev = 'job' + 1

myObject.logJob(654)

// console.table(myObject[objKev]);

let objKev = console.table(Object.keys(myObject));
// let objKev = console.log(Object.entries(myObject));  // .keys === .entries

let ourArray = []


for (let i = 0; index < objKev.length; index++) {
    const element = objkeys[i];
    ourArray = push(myObject[objkeys[i]])  
}

console.log(ourArray);
// Das ist die Art und Weise, wie man aus einen Object einen Array machen kann 


/////////////////////////////////////////////////////////////////////////////////////////// JSON ////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JSON stands for JavaScript Object Notation

// JavaScript has a built in function for converting JSON strings into JavaScript objects:
// 
// JSON.parse()
// 
// JavaScript also has a built in function for converting an object into a JSON string:
// 
// JSON.stringify()

// In JSON, values must be one of the following data types:
// 
// a string
// a number
// an object
// an array
// a boolean
// null

let myObject = {
    "name": "Flo"
    is_a_good_guy: true
    
};

console.log(myObject);

// JSONArray: filter-Methode

let myObjectArr = [
    {
        "name": "Max",
        "is_a_good_guy": true
    },
    {
        "name": "Peter",
        "is_a_good_guy": false
    },
    {
        "name": "Arnold",
        "is_a_good_guy": true
    },
    {
        "name": "Justus",
        "is_a_good_guy": false
    },
    {
        "name": "Bombur",
        "is_a_good_guy": false
    }
];

// arrow functions (not nessesary ig)
console.log(
    myObjectArr.filter((element) => {return word.length > 6})
// (element) === Parameter
// => === function Ersatz
// word.length > 6 === functionskörper === true oder false
);

console.log(
    myObjectArr.filter((element) => {return element['is_a_good_guy'] == true})
);

///////////////////// verschachtelte Objecte ///////////////////////////////////

let library = {
    "info": {
        // "key": "value",
        "name": "Stadtbibliothek",
        "location": {
            "city": "Musterstadt",
            "coordinates": { "lat": 48.1351, "lon": 11.582}
        }
    },
    "sections": {
        "fiction": [
            {
                "shelf": 1,
                "book": {
                    "title": "Die Verwandlung",
                    "author": {
                        "name": "Franz Kafka",
                        "born": "1883-07-03",
                        "died": "1924-06-03"
                    },
                    "year": 1915,
                    "status": "ausgeliehen"
                }
            },
            {
                "shelf": 2,
                "book": {
                    "title": "1949",
                    "author": {
                        "name": "Georg Orwell",
                        "born": "1903-06-25",
                        "died": "1950-01-21"
                    },
                    "year": 1949,
                    "status": "verfügbar"
                }
            }
        ],
        "nonfiction": [
            {
                "shelf": 3,
                "book": {
                    "title": "Eine kurze Geschichte der Zeit",
                    "author": {
                        "name": "Stephen Hawking",
                        "born": "1942-01-08",
                        "died": "2018-03-14"
                    },
                    "year": 1988,
                    "status": "verfügbar" 
                }
            }
        ]
    }
}