"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOwnerServices } from "@/hooks/use-owner-services"
import { useState } from "react"
import { Home, Building2 } from "lucide-react"

export default function OwnerServices() {
  const { services, loading, createService, deleteService, updateService, spaId } = useOwnerServices()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ 
    name: string
    description?: string
    durationMinutes: number
    price: number
    serviceType?: string
  } | null>(null)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Services</h1>
          <p className="mt-2 text-slate-600">Manage your spa services</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          disabled={creating}
          onClick={async () => {
            setCreating(true)
            try {
              await createService({ 
                name: "New Service", 
                description: "Add description here",
                durationMinutes: 60, 
                price: 100000, 
                spaId 
              })
            } finally {
              setCreating(false)
            }
          }}
        >
          {creating ? "Adding..." : "Add Service"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>{services.length} services available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Service Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service: any) => (
                  <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {editingId === service.id ? (
                        <Input value={editForm?.name ?? ""} onChange={(e) => setEditForm({ ...(editForm as any), name: e.target.value })} />
                      ) : (
                        service.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {editingId === service.id ? (
                        <Input 
                          value={editForm?.description ?? ""} 
                          placeholder="Enter description"
                          onChange={(e) => setEditForm({ ...(editForm as any), description: e.target.value })} 
                        />
                      ) : (
                        <span className="text-sm">{service.description || <span className="text-slate-400">No description</span>}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === service.id ? (
                        <Select
                          value={editForm?.serviceType ?? service.serviceType ?? "AT_SPA"}
                          onValueChange={(value) => setEditForm({ ...(editForm as any), serviceType: value })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AT_SPA">
                              <div className="flex items-center gap-2">
                                <Building2 size={14} />
                                At Spa
                              </div>
                            </SelectItem>
                            <SelectItem value="AT_HOME">
                              <div className="flex items-center gap-2">
                                <Home size={14} />
                                At Home
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={service.serviceType === "AT_HOME" ? "default" : "secondary"}>
                          {service.serviceType === "AT_HOME" ? (
                            <span className="flex items-center gap-1">
                              <Home size={12} />
                              At Home
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Building2 size={12} />
                              At Spa
                            </span>
                          )}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {editingId === service.id ? (
                        <Input
                          type="number"
                          value={editForm?.durationMinutes ?? 0}
                          onChange={(e) => setEditForm({ ...(editForm as any), durationMinutes: Number(e.target.value) })}
                        />
                      ) : (
                        `${service.durationMinutes ?? service.duration}m`
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {editingId === service.id ? (
                        <Input
                          type="number"
                          value={editForm?.price ?? 0}
                          onChange={(e) => setEditForm({ ...(editForm as any), price: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        new Intl.NumberFormat('vi-VN').format(Number(service.price) || 0)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        {editingId === service.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await updateService(service.id, { ...editForm, spaId })
                                setEditingId(null)
                                setEditForm(null)
                              }}
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditForm(null) }}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => { 
                                setEditingId(service.id)
                                setEditForm({ 
                                  name: service.name,
                                  description: service.description ?? "",
                                  durationMinutes: service.durationMinutes ?? service.duration, 
                                  price: parseFloat(service.price) || 0,
                                  serviceType: service.serviceType ?? "AT_SPA"
                                })
                              }}
                            >
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteService(service.id)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
