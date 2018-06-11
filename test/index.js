const fs = require("fs");

fs.readFile(".config.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        console.log("\x1b[33m%s\x1b[0m", "you have to run script  'npm run config' ");
    } else {
        process.env.HASH_TAG = JSON.parse(data).hashTag;
        process.env.COUNT = JSON.parse(data).count;
        process.env.DYNAMODB_TABLE = JSON.parse(data).dynamoDB;
        process.env.S3_BUCKET = JSON.parse(data).s3Bucket;
        process.env.AWS_REGION = "ap-northeast-2";

        const test = require("../dist/index");
        test.crawling(null, null, () => {
            console.log("-- test callback function");
        });
    }
});