/**
 * GET /
 * Challenges.
 */
var _ = require('lodash'),
    debug = require('debug')('freecc:cntr:challenges'),
    Challenge = require('./../models/Challenge'),
    resources = require('./resources');

var highestChallengeNumber = 53;


exports.returnNextChallenge = function(req, res) {
    if (req.user) {
        ch = req.user.challengesHash;
        if (req.user.challengesHash[0] > 0) {
            var max = Object.keys(ch).reduce(function(max, key) {
                return (max === undefined || ch[key] > ch[max]) ? +key : max;
            });
            nextChallenge = max + 1;
            res.redirect('challenges/' + nextChallenge);
        } else {
            res.redirect('challenges/0');
        }
    } else {
        return res.redirect('../challenges/0');
    }
};

exports.returnChallenge = function(req, res, next) {
    var challengeNumber = parseInt(req.params.challengeNumber) || 0;

    if (challengeNumber > highestChallengeNumber) {
        req.flash('errors', {
            msg: "It looks like you've either completed all the challenges we have available or requested a challenge we don't have."
        });
        return res.redirect('../challenges/0');
    }
    Challenge.find({}, null, { sort: { challengeNumber: 1 } }, function(err, c) {
        if (err) {
            debug('Challenge err: ', err);
            return next(err);
        }
        res.render('challenges/show', {
            title: 'Challenge: ' + c[challengeNumber].name,
            name: c[challengeNumber].name,
            video: c[challengeNumber].video,
            time: c[challengeNumber].time,
            steps: c[challengeNumber].steps,
            number: challengeNumber,
            cc: req.user ? req.user.challengesHash : undefined,
            points: req.user ? req.user.points : undefined,
            verb: resources.randomVerb(),
            phrase: resources.randomPhrase(),
            compliment: resources.randomCompliment(),
            challenges: c
        });
    });
};
