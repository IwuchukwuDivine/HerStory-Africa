// The layout registry. To add a layout: write emails/layouts/<id>.mjs with the
// same three exports (meta, assets, render) and add it to this list. Nothing
// else in the build needs to change.
import * as airmail from "./airmail.mjs";
import * as bulletin from "./bulletin.mjs";
import * as letter from "./letter.mjs";
import * as loveLetter from "./love-letter.mjs";
import * as test from "./test.mjs";

export const layouts = [loveLetter, letter, airmail, test, bulletin];

export const layoutById = (id) => layouts.find((layout) => layout.meta.id === id);
