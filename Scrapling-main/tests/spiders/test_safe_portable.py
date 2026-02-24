"""Tests for safe portable spider utilities."""

from scrapling.spiders.safe_portable import SiteProfile, SafePortableSpider
from scrapling.core._types import Any, Dict, AsyncGenerator


class _DemoSafeSpider(SafePortableSpider):
    async def parse(self, response) -> AsyncGenerator[Dict[str, Any], None]:
        yield {"url": str(response), "title": "ok"}


def test_site_profile_from_dict_valid() -> None:
    profile = SiteProfile.from_dict(
        {
            "name": "demo",
            "start_urls": ["https://example.com"],
            "allowed_domains": ["example.com"],
            "selectors": {"title": "h1::text"},
        }
    )

    assert profile.name == "demo"
    assert profile.start_urls == ["https://example.com"]
    assert profile.allowed_domains == {"example.com"}


def test_site_profile_from_dict_requires_start_urls() -> None:
    try:
        SiteProfile.from_dict({"name": "demo", "start_urls": []})
        raised = False
    except ValueError:
        raised = True

    assert raised is True


def test_is_safe_url_blocks_private_and_non_http() -> None:
    spider = _DemoSafeSpider(
        site_profile={
            "name": "demo",
            "start_urls": ["https://example.com"],
            "allowed_domains": ["example.com"],
        }
    )

    assert spider.is_safe_url("https://example.com/page") is True
    assert spider.is_safe_url("ftp://example.com/file") is False
    assert spider.is_safe_url("http://127.0.0.1:8080") is False


def test_on_scraped_item_requires_url_field() -> None:
    spider = _DemoSafeSpider(
        site_profile={
            "name": "demo",
            "start_urls": ["https://example.com"],
            "allowed_domains": ["example.com"],
        }
    )

    import anyio

    async def _run() -> Dict[str, Any] | None:
        return await spider.on_scraped_item({"title": "missing url"})

    result = anyio.run(_run)
    assert result is None
