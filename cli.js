var BasicCard = require('./BasicCard.js');
var ClozeCard = require('./ClozeCard.js');
var inquirer = require('inquirer');
var fs = require('fs');

inquirer.prompt([{
    name: 'command',
    message: 'Select',
    type: 'list',
    choices: [{
        name: 'add'
    }, {
        name: 'show'
    }]
}]).then(function(answer) {
    if (answer.command === 'add') {
        addCard();
    } else if (answer.command === 'show') {
        showCards();
    }
});

var addCard = function() {
    inquirer.prompt([{
        name: 'cardType',
        message: 'What kind of flashcard?',
        type: 'list',
        choices: [{
            name: 'basic'
        }, {
            name: 'cloze'
        }]
    }]).then(function(answer) {
        if (answer.cardType === 'basic') {
            inquirer.prompt([{
                name: 'front',
                message: 'What is the question?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Must provide a question');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'back',
                message: 'What is the answer?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Must provide an answer');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var newBasic = new BasicCard(answer.front, answer.back);
                newBasic.create();
                whatsNext();
            });
        } else if (answer.cardType === 'cloze') {
            inquirer.prompt([{
                name: 'text',
                message: 'What is the full text?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Must provide the full text');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'cloze',
                message: 'What is the cloze portion?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Must provide the cloze portion');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var text = answer.text;
                var cloze = answer.cloze;
                if (text.includes(cloze)) {
                    var newCloze = new ClozeCard(text, cloze);
                    newCloze.create();
                    whatsNext();
                } else {
                    console.log('The cloze portion is not a match. Please try again.');
                    addCard();
                }
            });
        }
    });
};

var whatsNext = function() {
    inquirer.prompt([{
        name: 'nextAction',
        message: 'What would you like to do next?',
        type: 'list',
        choices: [{
            name: 'create'
        }, {
            name: 'show'
        }, {
            name: 'quit'
        }]
    }]).then(function(answer) {
        if (answer.nextAction === 'create') {
            addCard();
        } else if (answer.nextAction === 'show') {
            showCards();
        } else if (answer.nextAction === 'quit') {
            return;
        }
    });
};

var showCards = function() {
    fs.readFile('./log.txt', 'utf8', function(error, data) {
        if (error) {
            console.log('Error occurred: ' + error);
        }
        var questions = data.split(';');
        var notBlank = function(value) {
            return value;
        };
        questions = questions.filter(notBlank);
        var count = 0;
        showQuestion(questions, count);
    });
};

var showQuestion = function(array, index) {
    question = array[index];
    var parsedQuestion = JSON.parse(question);
    var questionText;
    var correctReponse;
    if (parsedQuestion.type === 'basic') {
        questionText = parsedQuestion.front;
        correctReponse = parsedQuestion.back;
    } else if (parsedQuestion.type === 'cloze') {
        questionText = parsedQuestion.clozeDeleted;
        correctReponse = parsedQuestion.cloze;
    }
    inquirer.prompt([{
        name: 'response',
        message: questionText
    }]).then(function(answer) {
        if (answer.response === correctReponse) {
            console.log('Correct');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        } else {
            console.log('Wrong');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        }
    });
};