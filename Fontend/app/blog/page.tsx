"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { usePublicPosts, PublicPost } from "@/hooks/use-public-posts"
import { PostImage } from "@/components/post-image"
import { useLanguage } from "@/contexts/language-context"

export default function BlogPage() {
  const { posts, loading } = usePublicPosts()
  const { t, language } = useLanguage()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <MainHeader currentPath="/blog" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-1">
          <div className="text-center py-12" suppressHydrationWarning>{t.loading}</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/blog" />

      {/* Blog Section */}
      <section className="py-16 bg-slate-50 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 text-center mb-4" suppressHydrationWarning>{t.blogTitle}</h1>
          <p className="text-center text-slate-600 mb-12" suppressHydrationWarning>
            {t.blogDescription}
          </p>
          
          {posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg mb-4" suppressHydrationWarning>{t.noPostsYet}</p>
              <Link href="/">
                <Button variant="outline" suppressHydrationWarning>{t.backToHomepage}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post: PublicPost) => {
                const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString(language === "VN" ? 'vi-VN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : t.noDate
                const spaName = post.spa?.name || "Spa"
                return (
                  <Link href={`/blog/${post.id}`} key={post.id}>
                    <Card className="overflow-hidden hover:shadow-xl transition group cursor-pointer h-full flex flex-col">
                      <PostImage postId={post.id} spaId={post.spa?.id} />
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <p className="text-amber-500 text-sm font-medium mb-2">{spaName}</p>
                        <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 min-h-[2.5rem] flex-1">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-auto">{postDate}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
