from __future__ import annotations

import ipaddress
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import urlparse

from orjson import JSONDecodeError, loads as json_loads

from scrapling.spiders.request import Request
from scrapling.spiders.spider import Spider
from scrapling.core._types import Any, Dict, AsyncGenerator


@dataclass(slots=True)
class SiteProfile:
    """Config object describing how to crawl and extract a website safely."""

    name: str
    start_urls: list[str]
    allowed_domains: set[str] = field(default_factory=set)
    selectors: dict[str, str] = field(default_factory=dict)
    source: str = ""

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "SiteProfile":
        name = str(data.get("name", "")).strip()
        if not name:
            raise ValueError("Site profile requires a non-empty 'name'")

        start_urls_raw = data.get("start_urls", [])
        if not isinstance(start_urls_raw, list) or not start_urls_raw:
            raise ValueError("Site profile requires 'start_urls' as a non-empty list")

        start_urls = [str(url).strip() for url in start_urls_raw if str(url).strip()]
        if not start_urls:
            raise ValueError("Site profile must include at least one valid start URL")

        allowed_domains_raw = data.get("allowed_domains", [])
        if isinstance(allowed_domains_raw, list):
            allowed_domains = {str(d).strip().lower() for d in allowed_domains_raw if str(d).strip()}
        else:
            raise ValueError("'allowed_domains' must be a list when provided")

        selectors_raw = data.get("selectors", {})
        if not isinstance(selectors_raw, dict):
            raise ValueError("'selectors' must be a dict when provided")

        selectors = {
            str(key).strip(): str(value).strip()
            for key, value in selectors_raw.items()
            if str(key).strip() and str(value).strip()
        }

        source = str(data.get("source") or name).strip()
        return cls(
            name=name,
            start_urls=start_urls,
            allowed_domains=allowed_domains,
            selectors=selectors,
            source=source,
        )


def load_site_profile(path: str | Path) -> SiteProfile:
    """Load a site profile from a JSON file."""

    profile_path = Path(path)
    if not profile_path.exists():
        raise FileNotFoundError(f"Site profile not found: {profile_path}")

    try:
        data = json_loads(profile_path.read_bytes())
    except JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in site profile '{profile_path}': {exc}") from exc

    if not isinstance(data, dict):
        raise ValueError("Site profile JSON must contain a top-level object")

    return SiteProfile.from_dict(data)


class SafePortableSpider(Spider):
    """Reusable secure spider base for multi-site scraping."""

    # Safer crawl defaults for portability across websites.
    concurrent_requests = 2
    concurrent_requests_per_domain = 1
    download_delay = 1.0
    max_blocked_retries = 2

    # Output / flow controls.
    max_items: int = 10_000
    allow_private_network: bool = False

    # Field-level controls.
    required_fields: tuple[str, ...] = ("url",)

    def __init__(self, site_profile: SiteProfile | dict[str, Any], *args: Any, **kwargs: Any):
        self.site_profile = (
            site_profile if isinstance(site_profile, SiteProfile) else SiteProfile.from_dict(site_profile)
        )

        self.name = self.site_profile.name
        self.start_urls = list(self.site_profile.start_urls)
        self.allowed_domains = set(self.site_profile.allowed_domains)

        super().__init__(*args, **kwargs)

    @staticmethod
    def _is_private_or_loopback_host(hostname: str) -> bool:
        lowered = hostname.strip().lower()
        if lowered in {"localhost", "localhost.localdomain"}:
            return True

        try:
            ip = ipaddress.ip_address(lowered)
        except ValueError:
            return False

        return bool(
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        )

    def is_safe_url(self, url: str) -> bool:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"}:
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        if not self.allow_private_network and self._is_private_or_loopback_host(hostname):
            return False

        return True

    def safe_request(self, url: str, **kwargs: Any) -> Request:
        if not self.is_safe_url(url):
            raise ValueError(f"Unsafe URL blocked: {url}")
        return Request(url, **kwargs)

    async def start_requests(self) -> AsyncGenerator[Request, None]:
        if not self.start_urls:
            raise RuntimeError("Spider has no start URLs in site profile")

        for url in self.start_urls:
            yield self.safe_request(url, sid=self._session_manager.default_session_id)

    async def on_scraped_item(self, item: Dict[str, Any]) -> Dict[str, Any] | None:
        if self.max_items > 0 and self.stats.items_scraped >= self.max_items:
            self.logger.info("Max items reached (%s), pausing crawl", self.max_items)
            self.pause()
            return None

        missing = [field for field in self.required_fields if not item.get(field)]
        if missing:
            self.logger.warning("Dropping item with missing fields: %s", missing)
            return None

        normalized = dict(item)
        normalized.setdefault("source", self.site_profile.source or self.site_profile.name)
        normalized["scraped_at"] = datetime.now(UTC).isoformat()
        return normalized
