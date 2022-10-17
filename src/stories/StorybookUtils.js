/**
 * It returns an URI to API Doc story.
 * Furthermore, it receives a subpath to reference a component/method from
 * API documentation.
 * @param {string} subpath
 */
export const encodeApiDocURIForSubpath = subpath => {
  return '?path=/docs/api-doc--page&subpath=' + encodeURIComponent(subpath);
};
