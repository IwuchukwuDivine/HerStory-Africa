/**
 * NuxtImg provider override for a given source.
 * SVGs must not go through the image optimizer: IPX rasterises them to WebP
 * but keeps the `.svg` filename, so static hosts serve WebP bytes with an
 * SVG content type and browsers refuse to render them. Serving the SVG
 * as-is is also smaller than any raster variant.
 */
export default function imageProvider(src?: string | null) {
  return src && /\.svg(\?.*)?$/i.test(src) ? "none" : undefined;
}
