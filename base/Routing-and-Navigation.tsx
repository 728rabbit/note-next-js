/**
 * Type definition for page component props
 * 
 * In Next.js App Router, `params` is a Promise object
 * that must be awaited to access route parameter values
 */
interface PageProps {
  /**
   * Route parameters object (as a Promise)
   * 
   * Contains dynamic parameters captured from the URL
   * For example: /blog/hello-world => slug = "hello-world"
   */
  params: Promise<{
    /** Unique identifier for the blog post (URL-friendly string) */
    slug: string
  }>
}

/**
 * Blog post detail page component
 * 
 * This is a Next.js App Router page component that uses
 * dynamic routing [slug] to match specific blog posts
 * 
 * @param props - Page component properties
 * @param props.params - Promise containing route parameters
 * @returns Rendered blog detail page
 * 
 * @example
 * Visiting /blog/nextjs-tutorial will have slug = "nextjs-tutorial"
 */
export default async function BlogDetailPage({ params }: PageProps) {
  // Await the Promise to resolve and get the actual route parameters
  // Note: Must use `await`, otherwise it will throw an error
  const { slug } = await params

  return (
    <div>
      {/* Display the current slug value for debugging or demonstration */}
      <p>current slug：{slug}</p>
    </div>
  )
}
