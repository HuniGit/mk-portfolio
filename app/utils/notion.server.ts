type NotionPost = {
  title: string;
  description: string;
  pubDate: string;
  link: string;
};

type FetchNotionPostsParams = {
  token?: string;
  databaseId?: string;
  limit?: number;
};

function pickPlainTextTitle(titleProp: any): string {
  const arr = titleProp?.title;
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr.map((t: any) => t?.plain_text ?? "").join("").trim();
}

function pickRichText(richTextProp: any): string {
  const arr = richTextProp?.rich_text;
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr.map((t: any) => t?.plain_text ?? "").join("").trim();
}

function pickDate(dateProp: any): string | null {
  const d = dateProp?.date;
  return d?.start ?? null;
}

function stripDashes(id: string) {
  return id.replaceAll("-", "");
}

export async function fetchNotionPosts({
  token,
  databaseId,
  limit = 3,
}: FetchNotionPostsParams): Promise<NotionPost[]> {
  if (!token || !databaseId) return [];

  const url = `https://api.notion.com/v1/databases/${stripDashes(databaseId)}/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: limit,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Notion API error:", res.status, text);
    return [];
  }

  const json: any = await res.json();
  const results: any[] = Array.isArray(json?.results) ? json.results : [];

  return results.slice(0, limit).map((page) => {
    const props = page?.properties ?? {};
    const title =
      pickPlainTextTitle(props?.Name) ||
      pickPlainTextTitle(props?.Title) ||
      page?.id;

    const description =
      pickRichText(props?.Description) ||
      pickRichText(props?.Summary) ||
      "";

    const date =
      pickDate(props?.Date) ||
      page?.created_time ||
      new Date().toISOString();

    return {
      title,
      description,
      pubDate: date,
      link: page?.url ?? "",
    };
  });
}
