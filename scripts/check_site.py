"""Static checks for the hand-built portfolio site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import sys

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "about.html", "contact.html"]


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.refs = []  # (tag, attr, value)
        self._in_a = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        for attr in ("src", "href"):
            if attr in attrs and attrs[attr]:
                self.refs.append((tag, attr, attrs[attr]))
        if "data-full" in attrs:
            self.refs.append((tag, "data-full", attrs["data-full"]))


def is_local(value: str) -> bool:
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:")):
        return False
    parsed = urlparse(value)
    return not parsed.scheme and not parsed.netloc


def main() -> int:
    problems = []
    for page in PAGES:
        path = ROOT / page
        if not path.exists():
            problems.append(f"{page}: missing page")
            continue
        parser = Collector()
        parser.feed(path.read_text(encoding="utf-8"))

        dupes = {i for i in parser.ids if parser.ids.count(i) > 1}
        if dupes:
            problems.append(f"{page}: duplicate ids {sorted(dupes)}")

        for tag, attr, value in parser.refs:
            if not is_local(value):
                continue
            target = (path.parent / value.split("#")[0]).resolve()
            if value.split("#")[0] and not target.exists():
                problems.append(f"{page}: broken {attr}=\"{value}\" ({tag})")

        print(f"{page}: ids={len(parser.ids)} refs={len(parser.refs)}")

    # asset weight
    assets = ROOT / "assets"
    total = sum(p.stat().st_size for p in assets.rglob("*") if p.is_file())
    print(f"assets total: {total / 1024 / 1024:.1f} MB")

    if problems:
        print("\nPROBLEMS:")
        for p in problems:
            print(" -", p)
        return 1
    print("\nAll static checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
