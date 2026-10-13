#!/usr/bin/env python3
"""Copy the shared header, footer and booking form into every page.

Edit partials/header.html, partials/footer.html or partials/booking.html, then
run from the repo root:

    python3 tools/sync-layout.py

Each page marks where the layout goes with:

    <!-- layout:header --> ... <!-- /layout:header -->
    <!-- layout:footer --> ... <!-- /layout:footer -->
    <!-- layout:booking --> ... <!-- /layout:booking -->   (bike pages only)

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


BIKE_ACTION_BAR = '''<div class="action-bar action-bar--single">
        <a class="btn btn--primary" href="#quote">Book this bike</a>
    </div>'''


def block(name, content, indent):
    return f'{indent}<!-- layout:{name} -->\n{content}{indent}<!-- /layout:{name} -->'


def main():
    header = (ROOT / 'partials/header.html').read_text()
    footer = (ROOT / 'partials/footer.html').read_text()
    booking = (ROOT / 'partials/booking.html').read_text()

    for page in sorted(ROOT.glob('*.html')):
        html = page.read_text()
        if '<!-- layout:header -->' not in html:
            print(f'skip   {page.name} (no layout markers)')
            continue

        active = NAV_PARENT.get(page.name, page.name)
        page_header = header.replace(
            f'<li><a href="{active}">', f'<li><a href="{active}" aria-current="page">')

        # Bike pages send visitors to the booking form instead of WhatsApp.
        page_footer = footer
        if '<!-- layout:booking -->' in html:
            page_footer = re.sub(r'<div class="action-bar">.*?</div>', BIKE_ACTION_BAR, footer, flags=re.S)

        new = html
        for name, content in (('header', page_header), ('footer', page_footer), ('booking', booking)):
            new = re.sub(
                rf'([ \t]*)<!-- layout:{name} -->.*?<!-- /layout:{name} -->',
                lambda m: block(name, content, m.group(1)), new, flags=re.S)

        if new != html:
            page.write_text(new)
            print(f'update {page.name}')
        else:
            print(f'ok     {page.name}')


if __name__ == '__main__':
    main()
