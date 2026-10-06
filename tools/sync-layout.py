#!/usr/bin/env python3
"""Copy the shared header and footer into every page.

Edit partials/header.html or partials/footer.html, then run from the repo root:

    python3 tools/sync-layout.py

Each page marks where the layout goes with:

    <!-- layout:header --> ... <!-- /layout:header -->
    <!-- layout:footer --> ... <!-- /layout:footer -->

The menu link for the current page gets aria-current="page" (highlighted).
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Pages that should highlight a different menu item than their own.
NAV_PARENT = {
    'offroad-200.html': 'products.html',
    'zanella-zr200.html': 'products.html',
    'bmw-g650gs.html': 'products.html',
    'uruguayan-discovery-trail.html': 'best-motorcycle-routes-in-uruguay.html',
    'uruguayan-route-60.html': 'best-motorcycle-routes-in-uruguay.html',
    'uruguayan-hiking-trail-arequita.html': 'best-motorcycle-routes-in-uruguay.html',
    'travel-in-uruguay.html': 'best-motorcycle-routes-in-uruguay.html',
}


def block(name, content):
    return f'    <!-- layout:{name} -->\n{content}    <!-- /layout:{name} -->'


def main():
    header = (ROOT / 'partials/header.html').read_text()
    footer = (ROOT / 'partials/footer.html').read_text()

    for page in sorted(ROOT.glob('*.html')):
        html = page.read_text()
        if '<!-- layout:header -->' not in html:
            print(f'skip   {page.name} (no layout markers)')
            continue

        active = NAV_PARENT.get(page.name, page.name)
        page_header = header.replace(
            f'<li><a href="{active}">', f'<li><a href="{active}" aria-current="page">')

        new = html
        for name, content in (('header', page_header), ('footer', footer)):
            new = re.sub(
                rf'[ \t]*<!-- layout:{name} -->.*?<!-- /layout:{name} -->',
                lambda _: block(name, content), new, flags=re.S)

        if new != html:
            page.write_text(new)
            print(f'update {page.name}')
        else:
            print(f'ok     {page.name}')


if __name__ == '__main__':
    main()
