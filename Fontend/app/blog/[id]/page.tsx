"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { usePublicPost } from "@/hooks/use-public-post"
import { PostImage } from "@/components/post-image"
import { ArrowLeft, Calendar } from "lucide-react"

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { post, loading, error } = usePublicPost(postId)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MainHeader currentPath="/blog" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">Đang tải...</div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MainHeader currentPath="/blog" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <p className="text-lg text-slate-500 mb-4">{error || "Không tìm thấy bài viết"}</p>
            <Link href="/blog">
              <Button variant="outline">Quay lại danh sách blog</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "Chưa có ngày"
  const spaName = post.spa?.name || "Spa"

  return (
    <div className="min-h-screen bg-slate-50">
      <MainHeader currentPath="/blog" />

      {/* Blog Detail */}
      <article className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-amber-500 font-medium mb-4">
              <span>{spaName}</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{postDate}</span>
            </div>
          </div>

          {/* Post Image */}
          <div className="mb-8 rounded-lg overflow-hidden">
            <PostImage 
              postId={post.id} 
              spaId={post.spa?.id} 
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Post Content */}
          <div className="prose prose-slate max-w-none bg-white rounded-lg p-8 shadow-sm">
            <div 
              className="text-slate-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </div>

          {/* Spa Link */}
          {post.spa && (
            <div className="mt-8 text-center">
              <Link href={`/spas/${post.spa.id}`}>
                <Button variant="outline">
                  Xem thêm về {spaName}
                </Button>
              </Link>
            </div>
          )}

          {/* Back to Blog List */}
          <div className="mt-8 text-center">
            <Link href="/blog">
              <Button variant="ghost">
                ← Xem tất cả bài viết
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}

