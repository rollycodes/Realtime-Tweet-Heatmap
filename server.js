const { ETwitterStreamEvent, TwitterApi } = require('twitter-api-v2');
const Express = require('express');
const Socket = require('socket.io');
const Key = require('./config/key');
const Filter = require('./helper/filter');
const nluV1 = require('watson-developer-cloud/natural-language-understanding/v1');

const app = Express();
const server = app.listen(process.env.PORT || 8000);
app.use(Express.static('public'));
const io = Socket(server);




// const watson = new nluV1({
//     version: '2018-03-16',
//     username: process.env.USERNAME || Key.USERNAME,
//     password: process.env.PASSWORD || Key.PASSWORD
// });

io.sockets.on('connection', function(socket) {
    socket.emit('connection');

    socket.on('begin stream', async function() {
        count = 0;
        const twitterClient = new TwitterApi(process.env.BEARER_TOKEN || Key.BEARER_TOKEN);
        const rules = await twitterClient.v2.streamRules();
        //Delete any old rules
        if (rules.data != null && rules.data.length > 0) {
            await twitterClient.v2.updateStreamRules({
                delete: { ids: rules.data.map(rule => rule.id) },
            });
        }
        // Add our rules
        await twitterClient.v2.updateStreamRules({
            add: [{ value: 'india -is:retweet' }],
            add: [{ value: 'travel -is:retweet' }],
            add: [{ value: 'tour -is:retweet' }],
            add: [{ value: 'flight -is:retweet' }],
            add: [{ value: 'airport -is:retweet' }],
        });
        //Get stream
        const stream = await twitterClient.v2.searchStream({
            'tweet.fields': ['author_id', 'geo'],
            'user.fields': ['location', 'profile_image_url'],
            'place.fields': ['id', 'geo', 'country', 'full_name', 'name'],
            expansions: ['author_id', 'geo.place_id'],
        });
        // Enable auto reconnect
        stream.autoReconnect = true;
        //Process stream
        stream.on(ETwitterStreamEvent.Data, async tweet => {
            console.log(JSON.stringify(tweet));

            var city = "";
            var country = "";
            var screen_name = "";
            var profile_image_url = "";
            count++;
            if (count == 50) {
                stream.close();
            }

            if (tweet.includes != null && tweet.includes.places != null) {
                console.log("With location");
                var place = tweet.includes.places.find(x => x.id == tweet.data.geo.place_id);
                if (place != null) {
                    city = place.full_name;
                    country = place.country;
                }
            } else if (tweet.includes != null && tweet.includes.users != null) {
                var user = tweet.includes.users.find(x => x.id == tweet.data.author_id);
                if (user != null) {
                    city = city == "" ? user.location : city;
                    profile_image_url = user.profile_image_url;
                    screen_name = user.username;
                }
            }
            tweet.data["place"] = {};
            tweet.data["place"]["full_name"] = city;
            tweet.data["place"]["country"] = country;
            tweet.data["geo"]["coordinates"] = null;
            tweet.data["user"] = {};
            tweet.data["user"]["screen_name"] = screen_name;
            tweet.data["user"]["profile_image_url"] = profile_image_url;
            const tweetData = Filter.twitterData(tweet.data);
            //const parameters = Filter.watsonParameters(tweetData.text);
            // watson.analyze(parameters, function (_, response) {
            // const analyzedData = Filter.watsonData(response);
            //const filteredData = Object.assign({}, tweetData, analyzedData);
            const filteredData = Object.assign({}, tweetData);
            socket.emit('filteredData', filteredData);
            return;
        });




        // const search = { locations: '-180, -90, 180, 90' };
        //let count = 0;
        // twitter.stream('/statuses/filter', search, function (stream) {
        //     stream.on('data', function (data) {

        //         if (data.geo && data.place) {
        //             const tweetData = Filter.twitterData(data);
        //             const parameters = Filter.watsonParameters(tweetData.text);
        //             // watson.analyze(parameters, function (_, response) {
        //             // const analyzedData = Filter.watsonData(response);
        //             // const filteredData = Object.assign({}, tweetData, analyzedData);
        //             const filteredData = Object.assign({}, tweetData, {});
        //             socket.emit('filteredData', filteredData);
        //             // });
        //             if (++count === 100) stream.destroy();
        //         }
        //     });
        // });
    });
});