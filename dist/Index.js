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
const InstagramCrawler_1 = require("./InstagramCrawler");
const DynamoDBManager_1 = require("./DynamoDBManager");
const instaCrawler = new InstagramCrawler_1.default(process.env.HASH_TAG);
const dynamoDB = new DynamoDBManager_1.default(process.env.DYNAMODB_TABLE, process.env.AWS_REGION);
const crawlingLimit = Number(process.env.COUNT);
const failedLimit = 5;
let currentCount = 0;
let failedCount = 0;
const crawling = ($event, $context, $callback, $nextCursor) => {
    instaCrawler.getInstagramFeed($nextCursor).then(($res) => {
        saveCrawlingData($res.edges).then($r => {
            if (currentCount >= crawlingLimit) {
                $callback(null, {
                    statusCode: 200,
                    body: "FINISHED!!",
                });
            }
            else {
                if ($res.endCursor) {
                    console.log(`[index crawling] need more crawl, ${currentCount}/${crawlingLimit}`);
                    crawling($event, $context, $callback, $res.endCursor);
                }
                else {
                    $callback(null, {
                        statusCode: 200,
                        body: `SUCCESS!! ${currentCount}/${crawlingLimit}`,
                    });
                }
            }
        }).catch($saveErr => $callback($saveErr));
    }).catch($err => $callback($err));
};
const saveCrawlingData = ($list) => __awaiter(this, void 0, void 0, function* () {
    for (const data of $list) {
        if (currentCount >= crawlingLimit || failedCount >= failedLimit) {
            break;
        }
        yield new Promise(resolve => {
            if (!data.node.is_video) {
                resolve();
            }
            const text = data.node.edge_media_to_caption.edges ? data.node.edge_media_to_caption.edges[0].node.text : "";
            dynamoDB.getData(data.node.id).then(resolve).catch($res => {
                dynamoDB.saveData({
                    text,
                    id: data.node.id,
                    feed: `https://instagram.com/p/${data.node.shortcode}`,
                    image: data.node.display_url,
                    likes: data.node.edge_liked_by.count,
                    timestamp: data.node.taken_at_timestamp,
                }).then($r => {
                    currentCount += 1;
                    console.log(`[index saveCrawlingData] :: ${currentCount}/${crawlingLimit}`);
                    resolve();
                }).catch($err => {
                    failedCount += 1;
                    console.log(`[index saveCrawlingData] :: save failed`, $err);
                    resolve();
                });
            });
        });
    }
    if (failedCount >= failedLimit) {
        return Promise.reject({ statusCode: 500, msg: `error. data save failed to dynamoDB. It happpend ${failedLimit} times` });
    }
    return Promise.resolve();
});
module.exports = {
    crawling,
};
