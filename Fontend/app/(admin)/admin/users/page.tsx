"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Shield, User, Store, Plus, Trash2, Edit } from "lucide-react"

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    role: "CUSTOMER"
  })
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER"
  })
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getUsers()
      // Backend returns { data: { users: [...] } }
      const usersData = response.data?.data?.users || response.data?.users || []
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (error: any) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    try {
      if (!createFormData.name || !createFormData.email || !createFormData.password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }

      await adminAPI.createUser({
        name: createFormData.name,
        email: createFormData.email,
        password: createFormData.password,
        role: createFormData.role,
      })

      toast({
        title: "Success",
        description: "User created successfully",
      })

      setIsCreateDialogOpen(false)
      setCreateFormData({ name: "", email: "", password: "", role: "CUSTOMER" })
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to create user:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm(`Are you sure you want to delete user #${userId}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(userId)
    try {
      await adminAPI.deleteUser(userId)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleOpenEditDialog = (user: any) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "CUSTOMER"
    })
    setIsEditDialogOpen(true)
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      await adminAPI.updateUser(editingUser.id, {
        name: editFormData.name,
        phone: editFormData.phone,
        role: editFormData.role,
      })

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }


  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />
      case "OWNER":
        return <Store className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          {getRoleIcon(role)} Admin
        </Badge>
      case "OWNER":
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          {getRoleIcon(role)} Owner
        </Badge>
      default:
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          {getRoleIcon(role)} Customer
        </Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="mt-2 text-slate-600">Manage all users in the system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Fill in the information to create a new user account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <Input
                  placeholder="Enter user name"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <Select
                  value={createFormData.role}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} className="bg-amber-500 hover:bg-amber-600">
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email (cannot be changed)</label>
                <Input
                  type="email"
                  value={editingUser?.email || ""}
                  disabled
                  className="bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <Input
                  placeholder="Enter user name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input
                  placeholder="Enter phone number"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} className="bg-amber-500 hover:bg-amber-600">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{users.length} users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Created At</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">#{user.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.phone || "N/A"}</td>
                      <td className="px-4 py-3 text-sm">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* Hide delete button for ADMIN users */}
                          {user.role !== "ADMIN" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isDeleting === user.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
