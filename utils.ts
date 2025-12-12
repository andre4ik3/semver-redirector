export const PATH_COMPONENT = "\\/([a-zA-Z0-9_.-]+)";

export function respondWith(tarballUrl: string): Response {
  return new Response(null, {
    status: 307,
    headers: {
      "Location": tarballUrl,
      "Link": `<${tarballUrl}>; rel="immutable"`,
      // "Cache-Control": "max-age=300",
    },
  });
}
