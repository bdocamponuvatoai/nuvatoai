// remark-mdx-frontmatter exports each post's YAML frontmatter. lib/blog.ts validates it.
declare module '*.mdx' {
  export const frontmatter: unknown;
}
