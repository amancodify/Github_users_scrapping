var UserService = require("../service/UserService");
var UserModel = require('../model/UserModel');
const axios = require('axios');
var random_time = Math.floor(Math.random() * (90000 - 85000) + 85000);
var refreshIntervalId = null;
var dummy_iteration = 210;
var counter = 0;
var lambda_urls = [
    { url: "https://4nbczhjlk6.execute-api.us-east-2.amazonaws.com/default/GitHub_Connect_UserDetails_Ohio", active: true },
    { url: "https://n3cour6x82.execute-api.us-east-1.amazonaws.com/default/GitHub_Connect_UserDetails_NVirginia", active: true },
    { url: "https://j5e42s8xdh.execute-api.us-west-1.amazonaws.com/default/GitHub_Connect_UserDetails_NCalifornia", active: true },
    { url: "https://i6sg6fr7i5.execute-api.us-west-2.amazonaws.com/default/GitHub_Connect_UserDetails_Oregon", active: true },
    { url: "https://67bcly0c8j.execute-api.ap-south-1.amazonaws.com/default/GitHub_Connect_UserDetails_Mumbai", active: true },
    { url: "https://4oty5rabfh.execute-api.ap-northeast-2.amazonaws.com/default/GitHub_Connect_UserDetails_Seoul", active: true },
    { url: "https://i2rey3o9vh.execute-api.ap-southeast-1.amazonaws.com/default/GitHub_Connect_UserDetails_Singapore", active: true },
    { url: "https://25cmnu7zsi.execute-api.ap-southeast-2.amazonaws.com/default/GitHub_Connect_UserDetails_Sydney", active: true },
    { url: "https://vkju0qefbb.execute-api.ap-northeast-1.amazonaws.com/default/GitHub_Connect_UserDetails_Tokyo", active: true },
    { url: "https://bivqzfvg8a.execute-api.ca-central-1.amazonaws.com/default/GitHub_Connect_UserDetails_CanadaCentral", active: true },
    { url: "https://685llavn74.execute-api.eu-central-1.amazonaws.com/default/GitHub_Connect_UserDetails_Frankfurt", active: true },
    { url: "https://8x1r8qlht4.execute-api.eu-west-1.amazonaws.com/default/GitHub_Connect_UserDetails_Ireland", active: true },
    { url: "https://el6dvjeoi7.execute-api.eu-west-2.amazonaws.com/default/GitHub_Connect_UserDetails_London", active: true },
    { url: "https://9azhqupvt1.execute-api.eu-west-3.amazonaws.com/default/GitHub_Connect_UserDetails_Paris", active: true },
    { url: "https://aeotqvjqoe.execute-api.eu-north-1.amazonaws.com/default/GitHub_Connect_UserDetails_Stockholm", active: true },
    { url: "https://b7yu1mz62b.execute-api.me-south-1.amazonaws.com/default/GitHub_Connect_UserDetails_Bahrain", active: true },
    { url: "https://ge9s5afysb.execute-api.sa-east-1.amazonaws.com/default/GitHub_Connect_UserDetails_SaoPaulo", active: true },
    { url: "https://cgf7y24esc.execute-api.ap-east-1.amazonaws.com/default/GitHub_Connect_UserDetails_HongKong", active: true }];

var dummyLambda = [
    { url: "https://4nbczhjlk6.execute-api.us-east-2.amazonaws.com/default/GitHub_Connect_UserDetails_Ohio2", active: true }
];

// var lambda_urls = [
//     { url: "https://k5avt1o0nj.execute-api.us-east-2.amazonaws.com/default/GitHub_Connect_UserDetails_Ohio2", active: true },
//     { url: "https://qkf8en6hxh.execute-api.us-east-1.amazonaws.com/default/GitHub_Connect_UserDetails_NVirginia2", active: true },
//     { url: "https://aa17w3ffb9.execute-api.us-west-1.amazonaws.com/default/GitHub_Connect_UserDetails_NCalifornia2", active: true }];

async function getUserDetails_dummy(username, lambdaurl) {
    var userDetails;
    await axios.post(lambdaurl, {
        "username": username
    })
        .then(response => {
            userDetails = response.data;
            console.log(userDetails.login);
        })
        .catch(error => {
            var err = error.response;
            if (err != undefined) {
                console.log(`Lambda [ \x1b[31m${lambdaurl}\x1b[37m ]   is down !! `, err.data.message, counter += 1 );
            }
            else {
                console.log(`Lambda [ \x1b[31m${lambdaurl}\x1b[37m ]   is down !!  Some Other Error !!`);
            }
        });
}

async function getgitUserDetails(username, id, lambdaurl) {
    var userDetails;
    var alluserdetails = [];
    await axios.post(lambdaurl, {
        "username": username
    })
        .then(response => {
            userDetails = response.data
            if (userDetails != null || undefined) {
                var gituserdetail = new UserModel.UserDetails({
                    name: userDetails.name,
                    email: userDetails.email,
                    bio: userDetails.bio,
                    location: userDetails.location,
                    blog: userDetails.blog,
                    company: userDetails.company,
                    login: userDetails.login,
                    public_repos: userDetails.public_repos,
                    public_gists: userDetails.public_gists,
                    followers: userDetails.followers,
                    following: userDetails.following,
                    hireable: userDetails.hireable,
                    created_at: userDetails.created_at,
                    updated_at: userDetails.updated_at,
                    type: userDetails.type,
                    site_admin: userDetails.site_admin,
                    Repositories: userDetails.Repositories,
                });
                alluserdetails.push(gituserdetail);
                return UserService.createUserDetails(alluserdetails, id, username);
            }
            else {
                console.log(`\x1b[31mError While fetching User Details from github..Resetting the username id into orignal state\x1b[37m \n\n`);
                console.log(`Lambda: [\x1b[36m${lambdaurl}\x1b[37m] is down !!`);
                deactivateLambda(lambdaurl);
                return UserService.revertUsernamesFlags(id);
            }
        })
        .catch(error => {
            var err = error.response;
            if (err != undefined) {
                console.log(`Lambda [ \x1b[31m${lambdaurl}\x1b[37m ]   is down !! `, err.data.message, counter += 1 );
                if(username != "amancodify")
                {
                    deactivateLambda(lambdaurl);
                    return UserService.revertUsernamesFlags(id);
                }
            }
            else {
                console.log(`Lambda [ \x1b[31m${lambdaurl}\x1b[37m ]   is down !!  Some Other Error !!`, counter += 1 );
                if(username != "amancodify")
                {
                    deactivateLambda(lambdaurl);
                    return UserService.revertUsernamesFlags(id);
                }
            }
        });
}

async function getusernamesbatch(num) {
    return await UserService.getusernamesbatch(num);
}

function intervalManager(flag, fname, time) {
    if (flag)
        refreshIntervalId = setInterval(fname, time);
    else
        clearInterval(refreshIntervalId);
}

function restart() {
    setTimeout(() => {
        console.log("\nRestarting. . .\n");
        intervalManager(true, launch, random_time);
    }, 1800000 / 30); //1800000 is 30 minutes
}

function deactivateLambda(url) {
    var index_number = lambda_urls.findIndex(x => x.url == url);
    lambda_urls[index_number].active = false;
}

function resetLambdas() {
    for (let i in lambda_urls) {
        lambda_urls[i].active = true;
    }
    console.log("All Lamdas got Reset to ACTIVE State. . .");
}

function getActiveLambdas() {
    var activeLambdas = [];
    for (let i in lambda_urls) {
        if (lambda_urls[i].active === true) {
            activeLambdas.push(lambda_urls[i].url);
        }
    }
    return activeLambdas;
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
    return array;
}

// async function dummy() {
//     for (let x = 0; x <= dummy_iteration; x++) {
//         await getUserDetails_dummy("amancodify", dummyLambda[0].url);
//     }
// }

async function launch() {
    counter = 0;
    const activelambdas = getActiveLambdas();
    console.log("\n Total ", activelambdas.length, " Lambdas are Active !!\n");
    if (activelambdas.length > 5) {
        const shuffledlambda = await shuffle(activelambdas);
        const usernames = await getusernamesbatch(activelambdas.length);
        const iteration_count = dummy_iteration + activelambdas.length;
        for (let i = 0; i < iteration_count; i++) {
            if (i < iteration_count - activelambdas.length) {
                await getgitUserDetails("amancodify","3712537162537612", dummyLambda[0].url);
            }
            else {
                await getgitUserDetails(usernames[iteration_count - i].Username, usernames[iteration_count - i]._id, shuffledlambda[iteration_count - i]);
            }

        }
    }
    else {
        dummy_iteration = dummy_iteration + 10;
        console.log("\n*************************All Lambda Servers Needs Rest. . .Time to wait ('_')**************************\n")
        intervalManager(false);
        resetLambdas();
        restart();
        return await UserService.updateBrokenUsernames();
    }
    return await UserService.updateBrokenUsernames();
}

intervalManager(true, launch, random_time);
exports.getUserDetails = getgitUserDetails;
exports.getusernamesbatch = getusernamesbatch;