// content.js
// Send URL, title, question, and answer to server.
/* Example of info object:
 {
    "url": "http://stackoverflow.com/questions/7222449/nsdefaultrunloopmode-vs-nsrunloopcommonmodes",
    "path": "/questions/7222449/nsdefaultrunloopmode-vs-nsrunloopcommonmodes",
    "questionId": "7222449",
    "bestAnswerId": 7223765,
    "bestAnswer": "<p>A run loop is a mechanism that allows the system to wake up sleeping threads so that they may manage asynchronous events. Normally when you run a thread (with the exception of the main thread) there is an option to start the thread in a run loop or not. If the thread runs some sort or long-running operation without interaction with external events and without timers, you do not need a run loop, but if your thread needs to respond to incoming events, it should be attached to a run loop in order to wake up the thread when new events arrive. This is the case of <code>NSURLConnection<\/code> generated threads, as they only wake on incoming events (from the network).<\/p>\n\n<p>Each thread can be associated to multiple run loops, or can be associated to a specific run loop that can be set to work in different modes. A \"run loop mode\" is a convention used by the OS to establish some rules for when to deliver certain events or collect them to be delivered later.<\/p>\n\n<p>Usually all run loops are set to the \"default mode\" which establishes a default way to manage input events. For example: as soon as a mouse-dragging (Mac OS) or touch (on iOS) event happens then the mode for this run loop is set to event tracking; this means that the thread will not be woken up on new network events but these events will be delivered later when the user input event terminates and the run loop set to default mode again; obviously this is a choice made by the OS architects to give priority to user events instead of background events.<\/p>\n\n<p>If you decide to change the run loop mode for your <code>NSURLConnection<\/code> thread, by using <code>scheduleInRunLoop:forModes:<\/code>, then you can assign the thread to a special run loop <em>mode<\/em>, rather than the specific default run loop. The special pseudo-mode called <code>NSRunLoopCommonModes<\/code> is used by many input sources including event tracking. For example assigning <code>NSURLConnection<\/code>'s instance to the common mode means associates its events to \"tracking mode\" in addition to the \"default mode\". One advantage/disadvantage of associating threads with <code>NSRunLoopCommonModes<\/code> is that the thread will not be blocked by touch events.<\/p>\n\n<p>New modes can be added to the common modes, but this is quite a low-level operation.<\/p>\n\n<p>I would like to close by adding a few notes:<\/p>\n\n<ul>\n<li><p>Typically we need to use a set of images or\nthumbnails downloaded from the network with a table view. We may think that\ndownloading these images from the network while the table view is\nscrolling could improve the user experience (since we could see the images while\nscrolling), but this is not advantageous since the fluidity of\nscrolling can suffer greatly. In this example with <code>NSURLConnection<\/code> a run loop should not be used; it would be better to use the <code>UIScrollView<\/code> delegate methods to detect when scrolling is terminated and then update the table and download new items\nfrom the network;<\/p><\/li>\n<li><p>You may consider using GCD which will help you to \"shield\" your code\nfrom run loop management issues. In the example above, you may\nconsider adding your network requests to a custom serial queue.<\/p><\/li>\n<\/ul>\n",
    "bestAnswerCreationDate": 1314563889,
    "bestAnswerScore": 131,
    "title": "NSDefaultRunLoopMode vs NSRunLoopCommonModes",
    "question": "<p>Dear good people of stackoverflow, <\/p>\n\n<p>Just like the last time, I hereby bring up a question I recently tumble upon. I hope someone out there could shed some light on me.<\/p>\n\n<p>Whenever I try to download a big file behind scrollview, mkmapview or something, the downloading process gets halted as soon as I touch iPhone screen. Thankfully, an awesome blog post by <a href=\"http://www.pixeldock.com/blog/how-to-avoid-blocked-downloads-during-scrolling/\">Jörn<\/a> suggests an alternative option, using NSRunLoopCommonModes for connection. <\/p>\n\n<p>That gets me look into detail of the two modes, NSDefaultRunLoopMode and NSRunLoopCommonModes, but the apple document does not kindly explain, other than saying<\/p>\n\n<p>NSDefaultRunLoopMode<\/p>\n\n<blockquote>\n  <p>The mode to deal with input sources other than NSConnection objects.\n  This is the most commonly used run-loop mode.<\/p>\n<\/blockquote>\n\n<p>NSRunLoopCommonModes<\/p>\n\n<blockquote>\n  <p>Objects added to a run loop using this value as the mode are monitored by all run loop modes that have been declared as a member of the set of “common\" modes; see the description of CFRunLoopAddCommonMode for details.<\/p>\n<\/blockquote>\n\n<p>CFRunLoopAddCommonMode<\/p>\n\n<blockquote>\n  <p>Sources, timers, and observers get registered to one or more run loop modes and only run when the run loop is running in one of those modes. Common modes are a set of run loop modes for which you can define a set of sources, timers, and observers that are shared by these modes. Instead of registering a source, for example, to each specific run loop mode, you can register it once to the run loop’s common pseudo-mode and it will be automatically registered in each run loop mode in the common mode set. Likewise, when a mode is added to the set of common modes, any sources, timers, or observers already registered to the common pseudo-mode are added to the newly added common mode.<\/p>\n<\/blockquote>\n\n<p>Can anyone please explain the two in human language? <\/p>\n",
    "creationDate": 1314551142,
    "tags": [
       "iphone",
       "ios",
       "multithreading",
       "nsrunloop"
    ]
 }
 */
(function (){

    const sotrackerHost = "https://agile-plains-3571.herokuapp.com/"; //"http://localhost:3000/";

    (function main() {

        window.addEventListener('load', function onLoad() {
            console.log('Hello, world.');
            getStackOverflowPageInfo()
                .then(prlogResult('pageInfo: '))
                .then(sendPageInfoToSotrackerApi)
                .then(prlog('Page info successfully posted to sotracker API.'))
                .catch(function (err){
                    console.error(err);
                    alertUserStackExchangeApiError();
                });
            });

    })();

    // Fetch relevant page data.
    // Returns Promise
    function getStackOverflowPageInfo() {

        var info = {};

        // Get url and question id
        info.url = window.location.href;
        info.path = window.location.pathname;
        info.questionId = info.path.split('/')[2];
        info.questionId = parseInt(info.questionId);

        var stackExchangeApiQuestionUrl = 'https://api.stackexchange.com/2.2/questions/' + info.questionId + '/?site=stackoverflow&filter=withbody',
            prQuestion = window.fetch(stackExchangeApiQuestionUrl)
                .then(checkStatus)
                .then(getJsonFromResponse)
                .then(fetchedQuestion);

        var stackExchangeApiAnswersUrl = 'https://api.stackexchange.com/2.2/questions/' + info.questionId + '/answers?order=desc&sort=activity&site=stackoverflow&filter=withbody',
            prAnswers = window.fetch(stackExchangeApiAnswersUrl)
            .then(checkStatus)
            .then(getJsonFromResponse)
            .then(fetchedAnswers);

        return Promise.all([prQuestion, prAnswers])
            .then(function(){
                return info;
            });

        // Fetch question data
        function fetchedQuestion(data) {

            var question = data.items[0];
            if (data.quota_remaining <= 1){
                console.log('Stack Exchange API quota exceeded.')
            }
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

            // Convert timestamps from seconds to milliseconds
            info.bestAnswerCreationDate = info.bestAnswerCreationDate * 1000;
            info.creationDate = info.creationDate * 1000;

        }

    }

    function sendPageInfoToSotrackerApi(info) {

        // Validation
        var pageInfoSchema = {
            "url": "string",
            "path": "string",
            "questionId": "string",
            "bestAnswerId": "string",
            "bestAnswer": "string",
            "bestAnswerCreationDate":"number",
            "bestAnswerScore":"string",
            "title":"string",
            "question":"string",
            "creationDate":"number",
            "tags":"array"
        };
        if (!tv4.validate(info, pageInfoSchema)) {
            throw new Error(JSON.stringify(tv4.error, null, 4));
        }

        // Send page info
        return fetch(sotrackerHost + 'sotracker/views/?login=psytronx', {
            method:'POST',
            body:JSON.stringify(info)
        }).then(function(res){
            if (!res.ok){
                throw new Error(JSON.stringify(res));
            }
            return res;
        })
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
        window.alert('Stack Overflow Tracker: Our apologies - there was an error analyzing this page. Please try refreshing the page or visiting it later.');
    }

    // Returns function that calls console.log for result and then returns result for next step in promise chain.
    function prlog(message){
        return function(result){
            console.log(message);
            return result;
        };
    }
    // Same as above function, and also appends result to message passed into console.log.
    function prlogResult(message){
        return function(result){
            console.log(message, result);
            return result;
        };
    }

})();
