import axiosClient from "./axios-client"

// Bookings API
export const bookingsAPI = {
  create: (data: any) => axiosClient.post("/bookings", data),
  getAll: () => axiosClient.get("/bookings/me"),
  getOne: (id: number) => axiosClient.get(`/bookings/${id}`),
  reschedule: (id: number, data: any) => axiosClient.patch(`/bookings/${id}/reschedule`, data),
  cancel: (id: number, data: any) => axiosClient.patch(`/bookings/${id}/cancel`, data),
}

// Services API
export const servicesAPI = {
  create: (data: any) => axiosClient.post("/services", data),
  getAll: () => axiosClient.get("/services"),
  getOne: (id: number) => axiosClient.get(`/services/${id}`),
  update: (id: number, data: any) => axiosClient.patch(`/services/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/services/${id}`),
}

// Spas API
export const spasAPI = {
  create: (data: any) => axiosClient.post("/spas", data),
  getAll: () => axiosClient.get("/spas"),
  getFeatured: () => axiosClient.get("/spas/public/featured"),
  getNearby: (latitude: number, longitude: number, radius?: number) =>
    axiosClient.get("/spas/nearby", {
      params: { lat: latitude, lng: longitude, radius: radius || 10 },
    }),
  getOne: (id: number) => axiosClient.get(`/spas/public/${id}`),
  getServices: (spaId: number) => axiosClient.get(`/spas/${spaId}/services`),
  getStaff: (spaId: number) => axiosClient.get(`/spas/${spaId}/staff`),
  update: (id: number, data: any) => axiosClient.patch(`/spas/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/spas/${id}`),
  approve: (id: number, data: any) => axiosClient.patch(`/spas/${id}/approval`, data),
}

// Feedbacks API
export const feedbacksAPI = {
  create: (data: any) => axiosClient.post("/feedbacks", data),
  getRecent: () => axiosClient.get("/feedbacks/public/recent"),
}

// Notifications API
export const notificationsAPI = {
  getMyNotifications: () => axiosClient.get("/notifications/me"),
  getBookingNotifications: () => axiosClient.get("/notifications/bookings"),
}

// Customers API
export const customersAPI = {
  getAll: () => axiosClient.get("/customers"),
  create: (data: any) => axiosClient.post("/customers", data),
  getOne: (id: number) => axiosClient.get(`/customers/${id}`),
  update: (id: number, data: any) => axiosClient.put(`/customers/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/customers/${id}`),
}

// Owner APIs
export const ownerAPI = {
  // Services
  getServices: () => axiosClient.get("/services"),
  createService: (data: any) => axiosClient.post("/services", data),
  updateService: (id: number, data: any) => axiosClient.patch(`/services/${id}`, data),
  deleteService: (id: number) => axiosClient.delete(`/services/${id}`),

  // Spas (owner)
  getMySpas: () => axiosClient.get("/spas/mine"),

  // Customers (via Users)
  getCustomers: () => axiosClient.get("/users/customers/owner/me"),
  getCustomerDetail: (id: number) => axiosClient.get(`/users/${id}`),
  updateCustomerLoyalty: (id: number, loyaltyRank: string) => 
    axiosClient.patch(`/users/${id}/loyalty/rank`, { loyaltyRank }),

  // Bookings
  getBookings: () => axiosClient.get("/bookings/owner"),
  getBookingDetail: (id: number) => axiosClient.get(`/bookings/${id}`),
  updateBookingStatus: (id: number, data: any) => axiosClient.patch(`/bookings/${id}/status`, data),

  // Staff
  getStaff: () => axiosClient.get("/staff"),
  createStaff: (data: any) => axiosClient.post("/staff", data),
  updateStaff: (id: number, data: any) => axiosClient.patch(`/staff/${id}`, data),
  deleteStaff: (id: number) => axiosClient.delete(`/staff/${id}`),

  // Staff Shifts
  getStaffShifts: () => axiosClient.get("/staff/shifts"),
  createStaffShift: (data: any) => axiosClient.post("/staff/shifts", data),
  updateStaffShift: (id: number, data: any) => axiosClient.patch(`/staff/shifts/${id}`, data),
  deleteStaffShift: (id: number) => axiosClient.delete(`/staff/shifts/${id}`),

  // Staff Skills
  getStaffSkills: (staffId: number) => axiosClient.get(`/staff/${staffId}/skills`),
  addStaffSkill: (staffId: number, data: { name: string }) => axiosClient.post(`/staff/${staffId}/skills`, data),
  removeStaffSkill: (staffId: number, skillId: number) => axiosClient.delete(`/staff/${staffId}/skills/${skillId}`),

  // Promotions (coupons)
  getPromotions: () => axiosClient.get("/coupons"),
  createPromotion: (data: any) => axiosClient.post("/coupons", data),
  updatePromotion: (id: number, data: any) => axiosClient.patch(`/coupons/${id}`, data),
  deletePromotion: (id: number) => axiosClient.delete(`/coupons/${id}`),

  // Spa Info
  getSpaInfo: () => axiosClient.get("/owner/spa"),
  updateSpaInfo: (data: any) => axiosClient.patch("/owner/spa", data),

  // Dashboard Stats
  getDashboardStats: () => axiosClient.get("/owner/dashboard/stats"),

  // Staff Time Off
  requestTimeOff: (staffId: number, data: { startAt: string; endAt: string; reason?: string }) => 
    axiosClient.post(`/staff/${staffId}/time-off`, data),

  // Payouts
  getPayouts: (ownerId: number) => axiosClient.get(`/payouts/owner/${ownerId}`),
  getAvailableProfit: () => axiosClient.get("/payouts/available-profit"),
  requestPayout: (data: { ownerId: number; amount: number; notes?: string }) => axiosClient.post("/payouts", data),

  // Feedbacks
  getMyFeedbacks: () => axiosClient.get("/feedbacks/owner/mine"),

  // Reports
  createReport: (data: { targetType: string; targetId: number; reason: string }) => axiosClient.post("/reports", data),

  // Posts
  getPosts: () => axiosClient.get("/posts"),
  getSpaPosts: (spaId: number) => axiosClient.get(`/posts/spa/${spaId}`),
  createPost: (data: any) => axiosClient.post("/posts", data),
  updatePost: (id: number, data: any) => axiosClient.patch(`/posts/${id}`, data),
  deletePost: (id: number) => axiosClient.delete(`/posts/${id}`),

  // Media
  getMedia: () => axiosClient.get("/media"),
  getSpaMedia: (spaId: number) => axiosClient.get(`/media/spa/${spaId}`),
  uploadMedia: (file: File, relatedType: string, relatedId: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('relatedType', relatedType)
    formData.append('relatedId', relatedId.toString())
    return axiosClient.post("/media/upload", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteMedia: (id: number) => axiosClient.delete(`/media/${id}`),

  // Spa Images
  uploadSpaAvatar: (spaId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosClient.post(`/spas/${spaId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadSpaBackground: (spaId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosClient.post(`/spas/${spaId}/background`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getSpaAvatar: (spaId: number) => axiosClient.get(`/media/spa/${spaId}/avatar`),
  getSpaBackground: (spaId: number) => axiosClient.get(`/media/spa/${spaId}/background`),
}

// Admin APIs
export const adminAPI = {
  // Spas Management
  getSpas: () => axiosClient.get("/spas"), // Admin can see all spas
  getPendingSpas: () => axiosClient.get("/admin/spas/pending"),
  approveSpa: (id: number, data: { isApproved: boolean }) => axiosClient.patch(`/spas/${id}/approval`, data),
  rejectSpa: (id: number, data: { isApproved: boolean }) => axiosClient.patch(`/spas/${id}/approval`, data),

  // Bookings Management
  getAllBookings: () => axiosClient.get("/bookings"),

  // Users Management
  getUsers: () => axiosClient.get("/users"), // Admin can see all users
  getUserDetail: (id: number) => axiosClient.get(`/users/${id}`),
  updateUser: (id: number, data: any) => axiosClient.patch(`/users/${id}`, data),
  deleteUser: (id: number) => axiosClient.delete(`/users/${id}`),

  // Coupons Management
  getCoupons: () => axiosClient.get("/coupons"),
  createCoupon: (data: any) => axiosClient.post("/coupons", data),
  deleteCoupon: (id: number) => axiosClient.delete(`/coupons/${id}`),

  // Reports & Logs
  getReports: () => axiosClient.get("/admin/reports"),
  getLogs: () => axiosClient.get("/admin/logs"),

  // System Settings
  getSettings: () => axiosClient.get("/system-settings"),
  getSetting: (key: string) => axiosClient.get(`/system-settings/${key}`),
  createSetting: (data: any) => axiosClient.post("/system-settings", data),
  updateSetting: (key: string, data: any) => axiosClient.patch(`/system-settings/${key}`, data),
  deleteSetting: (key: string) => axiosClient.delete(`/system-settings/${key}`),

  // Owners Management
  getOwners: () => axiosClient.get("/admin/owners"),
  getOwnerDetail: (id: number) => axiosClient.get(`/admin/owners/${id}`),
  updateOwner: (id: number, data: any) => axiosClient.patch(`/admin/owners/${id}`, data),

  // Moderation
  getReportDetail: (id: number) => axiosClient.get(`/reports/${id}`),
  resolveReport: (id: number, data: any) => axiosClient.patch(`/reports/${id}/resolve`, data),

  // Homepage Images
  getHomepageImage: (tag: string) => axiosClient.get(`/media/homepage/${tag}`),
  uploadHomepageImage: (tag: string, formData: FormData) => 
    axiosClient.post(`/media/homepage/${tag}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Promotions
  getPromotions: () => axiosClient.get("/admin/promotions"),
  createPromotion: (data: any) => axiosClient.post("/admin/promotions", data),
  updatePromotion: (id: number, data: any) => axiosClient.patch(`/admin/promotions/${id}`, data),
  deletePromotion: (id: number) => axiosClient.delete(`/admin/promotions/${id}`),

  // CMS
  getPages: () => axiosClient.get("/admin/cms/pages"),
  getPageDetail: (id: number) => axiosClient.get(`/admin/cms/pages/${id}`),
  updatePage: (id: number, data: any) => axiosClient.patch(`/admin/cms/pages/${id}`, data),

  // Dashboard Stats
  getMetrics: () => axiosClient.get("/admin/metrics"),

  // Campaigns Management
  getCampaigns: () => axiosClient.get("/campaigns"),
  getCampaign: (id: number) => axiosClient.get(`/campaigns/${id}`),
  createCampaign: (data: any) => axiosClient.post("/campaigns", data),
  updateCampaign: (id: number, data: any) => axiosClient.patch(`/campaigns/${id}`, data),
  deleteCampaign: (id: number) => axiosClient.delete(`/campaigns/${id}`),
  updateCampaignStatus: (id: number, data: { isActive: boolean }) => axiosClient.patch(`/admin/campaigns/${id}/status`, data),

  // Notifications
  sendNotification: (data: { channel: string; userId?: number; message: string; meta?: any }) => 
    axiosClient.post("/notifications", data),
  getAllNotifications: () => axiosClient.get("/notifications"),
  getUserNotifications: (userId: number) => axiosClient.get(`/notifications/user/${userId}`),

  // Payouts (Admin)
  getPayouts: (ownerId: number) => axiosClient.get(`/payouts/owner/${ownerId}`),
  getAllPayouts: () => axiosClient.get("/admin/payouts"),
  getAvailableProfit: () => axiosClient.get("/payouts/available-profit"),
  requestPayout: (data: { ownerId: number; amount: number; notes?: string }) => axiosClient.post("/payouts", data),
  reviewPayout: (data: { payoutId: number; approved: boolean; notes?: string }) => 
    axiosClient.patch("/payouts/review", data),
  completePayout: (data: { payoutId: number; notes?: string }) => 
    axiosClient.patch("/payouts/complete", data),

  // Posts (Admin)
  getAllPosts: () => axiosClient.get("/posts"),
  updatePost: (id: number, data: any) => axiosClient.patch(`/posts/${id}`, data),
  deletePost: (id: number) => axiosClient.delete(`/posts/${id}`),

  // Media (Admin)
  getAllMedia: () => axiosClient.get("/media"),
}

// Users API
export const usersAPI = {
  me: () => axiosClient.get("/users/me"),
  getBookings: (userId: number) => axiosClient.get(`/users/${userId}/bookings`),
  getFeedbacks: (userId: number) => axiosClient.get(`/users/${userId}/feedbacks`),
  getLoyaltyRank: (userId: number) => axiosClient.get(`/users/${userId}/loyalty/rank`),
  getLoyaltyHistory: () => axiosClient.get("/loyalty/history"),
  update: (userId: number, data: { name?: string; phone?: string; address?: string }) => 
    axiosClient.patch(`/users/${userId}`, data),
  changePassword: (userId: number, data: { currentPassword: string; newPassword: string }) =>
    axiosClient.post(`/users/${userId}/change-password`, data),
  uploadAvatar: (userId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosClient.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getAvatar: (userId: number) => axiosClient.get(`/media/user/${userId}/avatar`),
}

// Coupons API
export const couponsAPI = {
  validate: (code: string) => axiosClient.get(`/coupons/validate?code=${code}`),
}
