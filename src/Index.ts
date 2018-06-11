
import InstagramCrawler, { InstagramCrawlerResult } from "./InstagramCrawler";
import DynamoDBManager from "./DynamoDBManager";

const instaCrawler: InstagramCrawler = new InstagramCrawler(process.env.HASH_TAG!);
const dynamoDB: DynamoDBManager = new DynamoDBManager(process.env.DYNAMODB_TABLE!, process.env.AWS_REGION!);
const crawlingLimit: number = Number(process.env.COUNT);
const failedLimit: number = 5;
let currentCount: number = 0;
let failedCount: number = 0;

const crawling = ($event, $context, $callback, $nextCursor?: string) => {

    instaCrawler.getInstagramFeed($nextCursor).then(($res: InstagramCrawlerResult) => {
        saveCrawlingData($res.edges).then($r => {
            if (currentCount >= crawlingLimit) {
                $callback(null, { 
                    statusCode: 200, 
                    body: `[Index crawling] FINISHED!! ${currentCount}/${crawlingLimit}`,
                });
            } else {
                if ($res.endCursor) {
                    console.log(`[Index crawling] need more crawl, ${currentCount}/${crawlingLimit}`);
                    crawling($event, $context, $callback, $res.endCursor);
                } else {
                    $callback(null, { 
                        statusCode: 200, 
                        body: `[Index crawling] SUCCESS!! ${currentCount}/${crawlingLimit}`,
                    });
                }
            }
        }).catch($saveErr => $callback($saveErr));
    }).catch($err => $callback($err));
};

const saveCrawlingData = async ($list: any[]) => {
    for (const data of $list) {
        await new Promise(resolve => {
            if (!data.node.is_video || currentCount >= crawlingLimit || failedCount >= failedLimit) {
                resolve();
            } else {
                const errorCallBack = ($err: Error) => {
                    failedCount += 1;
                    console.log(`[Index saveCrawlingData] :: save failed`, $err);
                    resolve();
                };

                dynamoDB.isCanSaveData(data.node.id).then(($res: any) => {
                    if ($res.statusCode === 201) {
                        resolve();
                    }
                    const text: string = data.node.edge_media_to_caption.edges ? data.node.edge_media_to_caption.edges[0].node.text : "";
                    
                    dynamoDB.saveData({
                        text,
                        id: data.node.id,
                        feed: `https://instagram.com/p/${data.node.shortcode}`,
                        image: data.node.display_url,
                        likes: data.node.edge_liked_by.count,
                        timestamp: data.node.taken_at_timestamp,
                    }).then($r => {
                        currentCount += 1;
                        console.log(`[Index saveCrawlingData] :: ${currentCount}/${crawlingLimit}`);
                        resolve();
                    }).catch(errorCallBack);
                }).catch(errorCallBack);
            }
        });
    }

    if (failedCount >= failedLimit) {
        return Promise.reject({ statusCode: 500, msg: `error. data save failed to dynamoDB. It happpend ${failedLimit} times` });
    }

    return Promise.resolve();
};

module.exports = {
    crawling,
};