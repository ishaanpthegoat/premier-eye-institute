/* Prefix for public/ assets referenced by plain string src (video, etc.).
   next/image and <Link> apply basePath automatically — raw elements don't. */
export function withBasePath(p: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;
}
