import * as readline from "readline";
import * as fs from "fs";

const rl: readline.ReadLine = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout,
});

const json: { hashTag: string, count: number, dynamoDB: string } = { 
    hashTag: "",
    count: 0,
    dynamoDB: "",
};

const questions: string[] = [
    "Please, type a hashtag to crawl. ex) selfie",
    "How many do you want to crawl images? ex) 50",
    "Please, type your DynamoDB name. (crawling data will save to this db)",
];

const warnings: string[] = [
    "you did not type anything... please type hashtag",
    "you typed a incorrect value... you should type a value as number",
    "you did not type anything... please type your DynamoDB table name",
];

const configure = async() => {
    for (const q of questions) {
        await new Promise(resolve => {
            console.log("\x1b[33m%s\x1b[0m", q);
            rl.once("line", line => promptCallback(line.trim(), q, resolve));
            rl.prompt();
        });
    }
    rl.close();
} ;

const promptCallback = (value: string, q: string, resolve: Function) => {
    switch (q) {
        case questions[0]:
            if (value.search(/\S/) === -1) {
                console.log(warnings[0]);
                rl.prompt();
            } else {
                json.hashTag = value;
                resolve();
            }
            break;

        case questions[1]:
            if (value.search(/\d/) === -1) {
                console.log(warnings[1]);
                rl.prompt();
            } else {
                json.count = Number(value);
                resolve();
            }
            break;

        case questions[2]:
            if (value.search(/\S/) === -1) {
                console.log(warnings[2]);
                rl.prompt();
            } else {
                json.dynamoDB = value;
                resolve();
            }
            break;  
        default: break;
    }
};

rl.on("close", () => {
    console.log(json);
    fs.writeFileSync("./.config.json", JSON.stringify(json));
    console.log("\x1b[33m%s\x1b[0m", "you can confirm this configuration at ./.config.json");
});

configure();
