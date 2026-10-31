# Emilia — A Personal Library

The reading station home is `../hub.html`. Keep its visible text in English.
Each real collection is represented by one clickable book. All five current URLs are preserved in `library.json`.

## Add another collection

1. Read the current hub and repository state; do not overwrite newer collections.
2. Add the new collection's English title, description and final URL to `library.json`.
3. Create a matching realistic book-spine image with an English title; optimize as transparent WebP. Preserve the source aspect ratio.
4. Add one `li.volume > a.book` to the shelf in `hub.html`, following the existing markup. Give it a unique accessible link name, image alt, `data-title`, and `data-description`.
5. Set height/width using the actual image proportions. The CSS keeps touch areas at least 48px wide and wraps additional books; book count is also updated at runtime. Update the static count for no-JavaScript use.
6. Verify every link, image load, keyboard focus, English-only home copy, reduced motion, and mobile layout. Publish the homepage and its new asset together.

This is a maintained collection, not an automatic crawler. Do not add placeholder books or claim that new pages are discovered automatically.

Homepage design: warm charcoal (#252221), cream (#e9dfc7), Bodoni/Didot serif display type, centered upright spines with restrained hover/focus movement. The supplied Marginalia image and video were visual references only; the five book assets were generated for Emilia. Original column content and learning records are unchanged.
