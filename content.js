// content.js
// Send URL, title, question, and answer to server.

(function main() {

    window.addEventListener('load', function onLoad() {
        console.log('Hello, world.');
        getStackOverflowPageInfo().then(function(info){

            console.log('info: ', info);

        }).catch(function(err){
            alertUserStackExchangeApiError();

        });
    });

    // Fetch relevant page data.
    // Returns Promise
    function getStackOverflowPageInfo() {

        var info = {};

        // Get url and question id
        info.url = window.location.href;
        info.pathname = window.location.pathname;
        info.questionId = info.pathname.split('/')[2];

        var stackExchangeApiQuestionUrl = 'https://api.stackexchange.com/2.2/questions/' + info.questionId + '/?site=stackoverflow&filter=withbody',
            questionPromise = window.fetch(stackExchangeApiQuestionUrl)
            .then(checkStatus)
            .then(getJsonFromResponse)
            .then(fetchedQuestion);

        var stackExchangeApiAnswersUrl = 'https://api.stackexchange.com/2.2/questions/' + info.questionId + '/answers?order=desc&sort=activity&site=stackoverflow&filter=withbody';
            answersPromise = window.fetch(stackExchangeApiAnswersUrl)
            .then(checkStatus)
            .then(getJsonFromResponse)
            .then(fetchedAnswers);

        return Promise.all([questionPromise, answersPromise])
            .then(function(){
                return info;
            });

        // Fetch question data
        function fetchedQuestion(data) {
            var question = data.items[0];
            info.quotaRemaining = data.quota_remaining;
            info.title = question.title;
            info.question = question.body;
            info.creationDate = question.creation_date;
            info.tags = question.tags;
        }

        // Fetch data from accepted answer or answer with highest score
        function fetchedAnswers(data) {
            var answers = data.items,
                maxAnswerScore = 0,
                maxAnswerScoreIndex = 0;
            info.answerQuotaRemaining = data.quota_remaining;
            for (var i = 0; i < answers.length; i++){

                if (maxAnswerScore < answers[i].score){
                    maxAnswerScore = answers[i].score;
                    maxAnswerScoreIndex = i;
                }

                if (answers[i].is_accepted){
                    info.bestAnswerId = answers[i].answer_id;
                    info.bestAnswer = answers[i].body;
                    info.bestAnswerCreationDate = answers[i].creation_date;
                    info.bestAnswerScore = answers[i].score;
                    break;
                }

            }
            // If no accepted answer, use answer with highest score
            if (!info.bestAnswerId){
                info.bestAnswerId = answers[maxAnswerScoreIndex].answer_id;
                info.bestAnswer = answers[maxAnswerScoreIndex].body;
                info.bestAnswerCreationDate = answers[maxAnswerScoreIndex].creation_date;
                info.bestAnswerScore = answers[maxAnswerScoreIndex].score;
            }
        }

    }

    /* Helper Functions */

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    function getJsonFromResponse(response){
        return response.json();
    }

    function alertUserStackExchangeApiError(){
        window.alert('Stack Overflow Tracker Error: Our apologies - there was an error analyzing this page. Please try refreshing the page or visiting it later.');
    }

})();

