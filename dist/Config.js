"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const fs = require("fs");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const json = {
    hashTag: "",
    count: 0,
    dynamoDB: "",
};
const questions = [
    "Please, type a hashtag to crawl. ex) selfie",
    "How many do you want to crawl images? ex) 50",
    "Please, type your DynamoDB name. (crawling data will save to this db)",
];
const warnings = [
    "you did not type anything... please type hashtag",
    "you typed a incorrect value... you should type a value as number",
    "you did not type anything... please type your DynamoDB bucket",
];
const configure = () => __awaiter(this, void 0, void 0, function* () {
    for (const q of questions) {
        yield new Promise(resolve => {
            console.log("\x1b[33m%s\x1b[0m", q);
            rl.once("line", line => promptCallback(line.trim(), q, resolve));
            rl.prompt();
        });
    }
    rl.close();
});
const promptCallback = (value, q, resolve) => {
    switch (q) {
        case questions[0]:
            if (value.search(/\S/) === -1) {
                console.log(warnings[0]);
                rl.prompt();
            }
            else {
                json.hashTag = value;
                resolve();
            }
            break;
        case questions[1]:
            if (value.search(/\d/) === -1) {
                console.log(warnings[1]);
                rl.prompt();
            }
            else {
                json.count = Number(value);
                resolve();
            }
            break;
        case questions[2]:
            if (value.search(/\S/) === -1) {
                console.log(warnings[2]);
                rl.prompt();
            }
            else {
                json.dynamoDB = value;
                resolve();
            }
            break;
        case questions[3]:
            if (value.search(/\S/) === -1) {
                console.log(warnings[3]);
                rl.prompt();
            }
            else {
                json.s3Bucket = value;
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
