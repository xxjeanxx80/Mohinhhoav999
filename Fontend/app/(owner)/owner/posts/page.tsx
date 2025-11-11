"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useOwnerPosts } from "@/hooks/use-owner-posts"
import { useToast } from "@/hooks/use-toast"
import { ownerAPI } from "@/lib/api-service"
import { useState } from "react"
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OwnerPosts() {
  const { posts, loading, createPost, updatePost, deletePost, refetch } = useOwnerPosts()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    content: "",
    isPublished: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const { toast } = useToast()

  const handleEdit = (post: any) => {
    setForm({
      title: post.title,
      content: post.content,
      isPublished: post.isPublished || false,
    })
    setEditingId(post.id)
    setImageFile(null)
    setImagePreview(null)
    setShowForm(true)
  }

  const resetForm = () => {
    setForm({ title: "", content: "", isPublished: false })
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    setShowForm(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Chỉ được upload file ảnh",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      let postId: number | null = null
      if (editingId) {
        await updatePost(editingId, form)
        postId = editingId
      } else {
        const result = await createPost(form)
        // Extract post ID from response
        if (result) {
          postId = result.id || result?.data?.id || null
        }
      }

      // Upload image if provided and we have a postId
      if (imageFile && postId) {
        setUploadingImage(true)
        try {
          await ownerAPI.uploadMedia(imageFile, 'POST', postId)
          toast({
            title: "Thành công",
            description: "Đã tải lên ảnh cho bài viết",
          })
        } catch (error: any) {
          console.error("Failed to upload image:", error)
          toast({
            title: "Cảnh báo",
            description: "Bài viết đã được lưu nhưng không thể tải lên ảnh",
            variant: "destructive",
          })
        } finally {
          setUploadingImage(false)
        }
      } else if (imageFile && !postId) {
        toast({
          title: "Cảnh báo",
          description: "Không thể tải lên ảnh vì không tìm thấy ID bài viết",
          variant: "destructive",
        })
      }

      resetForm()
      refetch()
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return
    }

    try {
      await deletePost(id)
      refetch()
    } catch (error) {
      // Error already handled in hook
    }
  }

  const handleTogglePublish = async (post: any) => {
    try {
      await updatePost(post.id, { isPublished: !post.isPublished })
      refetch()
    } catch (error) {
      // Error already handled in hook
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Bài viết</h1>
          <p className="mt-2 text-slate-600">Tạo và quản lý các bài viết/blog</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo Bài viết
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Chỉnh sửa Bài viết" : "Tạo Bài viết mới"}</CardTitle>
            <CardDescription>
              {editingId ? "Cập nhật thông tin bài viết" : "Viết bài để chia sẻ với khách hàng"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Cẩm nang chăm sóc da"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Viết nội dung bài viết..."
                  rows={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Ảnh bài viết (hiển thị ở homepage)</Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600 mb-2">Chọn ảnh để upload</p>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image')?.click()}
                      >
                        Chọn ảnh
                      </Button>
                    </div>
                  )}
                  {!imagePreview && (
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isPublished">Trạng thái</Label>
                <Select
                  value={form.isPublished ? "true" : "false"}
                  onValueChange={(value) => setForm({ ...form, isPublished: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Công khai</SelectItem>
                    <SelectItem value="false">Nháp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting || uploadingImage} className="bg-red-600 hover:bg-red-700">
                  {submitting || uploadingImage ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo Bài viết"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tất cả Bài viết
          </CardTitle>
          <CardDescription>{posts.length} bài viết</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Chưa có bài viết nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{post.title}</h3>
                        <Badge className={post.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {post.isPublished ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Công khai
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Nháp
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Tạo: {new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                        {post.updatedAt && (
                          <span>Cập nhật: {new Date(post.updatedAt).toLocaleDateString("vi-VN")}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePublish(post)}
                      >
                        {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

