import axios from 'axios';
import { sequelize, models } from '@/src/db/db';

const subreddits = ['Design', 'UI_Design', 'graphic_design'];

const FASTAPI_URL=process.env.FASTAPI_URL

export async function fetchRedditTrends() {
  try {
    await sequelize.authenticate();

    if (!models.Trend) {
      throw new Error("Trend model not initialized");
    }

    for (const subreddit of subreddits) {
      const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=10&t=day`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'GenPrintAI/1.0' }
      });

      const posts = response.data.data.children;

      for (const post of posts) {
        const data = post.data;
        const title = data.title ?? "";

        // Call FastAPI to extract AI trend
        let trend: string | null = null;
        try {
          const apiResponse = await axios.post(`${FASTAPI_URL}/extract-trend`, { text: title });
          trend = apiResponse.data?.trend?.trim() || null;
        } catch (err) {
          console.error("Trend extraction API error:", err);
          continue;
        }

        if (!trend) continue;

        await models.Trend.upsert({
          source: "reddit",
          title: trend,
          url: `https://reddit.com${data.permalink}`,
          category: "design-trend",
          score: data.score,
          metadata: data,
          last_updated: new Date(),
        });
      }
    }

    console.log('Reddit trends updated!');
  } catch (error) {
    console.error('Reddit fetch error:', error);
  }
}
