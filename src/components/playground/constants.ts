/** dataTransfer MIME type used to drag palette entries onto the canvas.
 *  Lives in its own module so the palette chunk does not pull in the
 *  React Flow canvas (both are lazy-loaded independently). */
export const SLUG_DND_TYPE = 'application/x-erc-slug';
