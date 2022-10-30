#!/usr/bin/env node

const commands = ['get', 'post', 'put', 'patch', 'delete', 'help'];

const chalk = require('chalk');
const args = process.argv;
const arg = args[2];

const rl = require('readline');

const axios = require('axios').default;

// usage function to represent help guide
const usage = function() {
    const usageText = `
    REST Client in CLI is faster to open that the one with UI

    usage:
        rest <command>

        commands can be:

        get:        makes get request
        post:       makes post request
        put:        makes put request
        patch:      makes patch request
        delete:     makes delete request
    `;

    console.log(usageText);
};

// log errors with red color
function errorLog(error) {
    const eLog = chalk.red(error);
    console.log(eLog);
};

// log successfull request with white color
function successLog(data) {
    // const sLog = chalk.whiteBright(data);
    // console.log(sLog);
    console.log(data);
};

// prompts
function prompt(question) {
    const r = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    return new Promise((resolve, reject) => {
        try {
            r.question(question, answer => {
                r.close();
                resolve(answer);
            });
        } catch (e) {
            reject(e);
        }
    });
};

async function newRequest(method) {
    let options = {
        method
    };

    let q = chalk.blue(`Type in url: `);
    prompt(q).then(url => {
        if (!url) {
            errorLog(`URL is required argument`);
            return usage();
        };
        options.url = url;
        
        q = chalk.blue(`Type in headers: \n`);
        prompt(q).then(headers => {
            if (!headers) headers = '{}';
            try {
                options.headers = JSON.parse(headers);
            } catch (e) {
                errorLog(`Header syntax is invalid.\nSyntax example:\n\n{"user":"Joe","token":"blahblahblah"}`);
                return usage();
            }

            // headers parsed section
            if (method == "get" || method == "delete") {
            
                (async() => {
                    await axiosReq(options)
                    .then(data => {

                        let response = `HTTP/1.1 ${data.statusCode} ${data.status}\n`;

                        var headerKeys = Object.keys(data.headers);

                        headerKeys.forEach(h => {
                            var syntax = `${h}: ${data.headers[h]}`;

                            response = response + syntax + "\n";
                        });

                        response = response + "\n" + JSON.stringify(data.body, null, ' ');

                        q = chalk.greenBright(`Choose response format ["json", "text"]: `);
                        prompt(q).then(resType => {
                            if (!resType) return successLog(data);

                            if (resType == "text") return successLog(response);

                            return successLog(data);
                        });

                    })
                    .catch(err => {
                        errorLog(`Error occured:\n ${err}\n\n`);
                        return usage();
                    });
                })();

            } else { // calling post, patch, put methods
                q = chalk.blue(`Type in body: \n`);
                prompt(q).then(body => {
                    if (!body) body = '{}';
                    try {
                        options.data = JSON.parse(body);
                    } catch (e) {
                        errorLog(`Body syntax is invalid.\nSyntax example:\n\n{"user":"Joe","token":"blahblahblah"}`);
                        return usage();
                    }

                    (async() => {
                        await axiosReq(options)
                        .then(data => {
    
                            let response = `HTTP/1.1 ${data.statusCode} ${data.status}\n`;
    
                            var headerKeys = Object.keys(data.headers);
    
                            headerKeys.forEach(h => {
                                var syntax = `${h}: ${data.headers[h]}`;
    
                                response = response + syntax + "\n";
                            });
    
                            response = response + "\n" + JSON.stringify(data.body, null, ' ');
    
                            q = chalk.greenBright(`Choose response format ["json", "text"]: `);
                            prompt(q).then(resType => {
                                if (!resType) return successLog(data);
    
                                if (resType == "text") return successLog(response);
    
                                return successLog(data);
                            });
    
                        })
                        .catch(err => {
                            errorLog(`Error occured:\n ${err}\n\n`);
                            return usage();
                        });
                    })();

                });
            }
        })
    })
    .catch(err => {
        errorLog(`Error occured:\n ${err}\n\n`);
        return usage();
    });
};

async function axiosReq(opts) {
    return new Promise((resolve, reject) => {
        axios(opts)
            .then(res => {
                var response = {
                    status: res.statusText,
                    statusCode: res.status,
                    headers: res.headers,
                    body: res.data
                };

                return resolve(response);
            })
            .catch(err => {
                return reject(err);
            });
    });
};

// Check if no argument is passed
if (args.length == 2) {
    errorLog(`You need to define a method`);
    return usage();
};

// Only one argument can be specified (+2 which are must-have)
if (args.length > 3) {
    errorLog(`Only one method can be used`);
    return usage();
};

// Check if command is valid
if (commands.indexOf(arg) == -1) {
    errorLog(`Command "${arg}" doesn't exist`);
    return usage();
};

switch(arg) {
    case 'help':
        usage();
        break;
    case 'get':
        newRequest(arg);
        break;
    case 'post':
        newRequest(arg);
        break;
    case 'put':
        newRequest(arg);
        break;
    case 'patch':
        newRequest(arg);
        break;
    case 'delete':
        newRequest(arg);
        break;
    default:
        errorLog(`Command "${arg}" is invalid`);
        usage();
        break;
};