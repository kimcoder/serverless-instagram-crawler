import * as request from "request";

export interface InstagramCrawlerResult {
    edges: any[];
    endCursor?: string;
}

export default class InstagramCrawler {
    hashTag: string;
    url: string;

    constructor(hashTag: string) {
        this.hashTag = hashTag;
        this.url = `https://www.instagram.com/explore/tags/${this.hashTag}/?__a=1`;
    }

    getInstagramFeed($endCursor?: string) {
        return new Promise((resolve, reject) => {
            const next = $endCursor ? `&max_id=${$endCursor}` : "";
            const url = encodeURI(`${this.url}${next}`);
            const headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0",
                "Content-Type": "application/x-www-form-urlencoded",
            };

            request({ url, headers }, ($err, $res, $body) => {
                console.log("[InstagramCrawler getInstagramFeed] error:", $err);
                console.log("[InstagramCrawler getInstagramFeed] statusCode:", $res && $res.statusCode);
                if ($err) {
                    reject({ statusCode: 500, msg: "get instagram feed error", error: $err });
                } else if ($res.statusCode === 200) {
                    const data = JSON.parse($body);
                    const result: InstagramCrawlerResult = {
                        edges: data.graphql.hashtag.edge_hashtag_to_media.edges,
                    };
                    if (data.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page) {
                        result.endCursor = data.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor;
                    }

                    resolve(result);
                } else {
                    reject({ statusCode: $res.statusCode, msg: "get instagram feed error", error: $res });
                }
            });
        });
    }
}