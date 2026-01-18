/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseString } from "xml2js";
import { VelogArticle } from "~/types/velog_article";

export async function fetchNotionPosts(
  username: string,
  limit: number = 3
): Promise<VelogArticle[]> {
  try {
    const rssUrl = `https://api.velog.io/rss/@${username}`;

    const response = await fetch(rssUrl);

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xmlData = await response.text();

    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          console.error("XML parsing error:", err);
          reject(err);
          return;
        }

        try {
          // 다양한 RSS 구조에 대응
          let items: any[] = [];

          // 일반적인 RSS 구조 시도
          if (result.rss && result.rss.channel) {
            const channel = Array.isArray(result.rss.channel)
              ? result.rss.channel[0]
              : result.rss.channel;
            items = channel.item || [];
          }
          // feed 구조 시도 (Atom feed)
          else if (result.feed && result.feed.entry) {
            items = result.feed.entry;
          }
          // 다른 구조들 시도
          else if (result.channel && result.channel.item) {
            items = result.channel.item;
          }

          if (items.length === 0) {
            console.warn("No items found in RSS feed");
            resolve([]);
            return;
          }

          const posts: VelogArticle[] = items
            .slice(0, limit)
            .map((item: any) => {
              // 다양한 RSS 형태에 맞춰 데이터 추출
              const title = item.title
                ? Array.isArray(item.title)
                  ? item.title[0]
                  : item.title
                : "제목 없음";

              const description = item.description
                ? Array.isArray(item.description)
                  ? item.description[0]
                  : item.description
                : item.summary
                ? Array.isArray(item.summary)
                  ? item.summary[0]
                  : item.summary
                : "";

              const link = item.link
                ? Array.isArray(item.link)
                  ? item.link[0]
                  : item.link
                : "#";

              const pubDate = item.pubDate
                ? Array.isArray(item.pubDate)
                  ? item.pubDate[0]
                  : item.pubDate
                : item.published
                ? Array.isArray(item.published)
                  ? item.published[0]
                  : item.published
                : new Date().toISOString();

              const categories = item.category || [];
              const author = item["dc:creator"]
                ? Array.isArray(item["dc:creator"])
                  ? item["dc:creator"][0]
                  : item["dc:creator"]
                : username;

              return {
                title: typeof title === "string" ? title : String(title),
                description:
                  typeof description === "string"
                    ? description.replace(/<[^>]*>/g, "")
                    : String(description).replace(/<[^>]*>/g, ""),
                link: typeof link === "string" ? link : String(link),
                pubDate:
                  typeof pubDate === "string" ? pubDate : String(pubDate),
                categories: Array.isArray(categories) ? categories : [],
                author: typeof author === "string" ? author : String(author),
              };
            });

          resolve(posts);
        } catch (parseError) {
          console.error("Error processing RSS data:", parseError);
          reject(parseError);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching Velog posts:", error);
    return [];
  }
}
