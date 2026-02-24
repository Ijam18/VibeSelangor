from __future__ import annotations

from scrapling.spiders import Response
from scrapling.spiders.safe_portable import SafePortableSpider, load_site_profile
from scrapling.core._types import Any, Dict, AsyncGenerator


class PortableQuotesSpider(SafePortableSpider):
    """Example portable spider driven by site profile JSON."""

    required_fields = ("url", "quote")

    async def parse(self, response: Response) -> AsyncGenerator[Dict[str, Any], None]:
        quote_selector = self.site_profile.selectors.get("quote", "div.quote")
        text_selector = self.site_profile.selectors.get("quote_text", "span.text::text")
        author_selector = self.site_profile.selectors.get("quote_author", "small.author::text")
        next_selector = self.site_profile.selectors.get("next_page", "li.next a::attr(href)")

        for block in response.css(quote_selector):
            quote = block.css(text_selector).get("")
            author = block.css(author_selector).get("")
            yield {
                "url": response.url,
                "quote": quote.strip(),
                "author": author.strip(),
            }

        next_page = response.css(next_selector).get()
        if next_page:
            next_url = response.urljoin(next_page)
            if self.is_safe_url(next_url):
                yield response.follow(next_page, callback=self.parse)


if __name__ == "__main__":
    profile = load_site_profile("examples/site_profile.example.json")
    spider = PortableQuotesSpider(site_profile=profile, crawldir="crawl_data/quotes")
    result = spider.start()
    result.items.to_jsonl("output/quotes.jsonl")
    print(f"Items scraped: {result.stats.items_scraped}")
