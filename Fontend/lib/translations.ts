/**
 * Translation strings for Vietnamese (VN) and English (US)
 */

export type Language = "VN" | "US"

export interface Translations {
  // Navigation
  home: string
  services: string
  blog: string
  about: string
  
  // Auth
  login: string
  signup: string
  logout: string
  loggedOut: string
  loggedOutSuccess: string
  
  // Common
  loading: string
  error: string
  search: string
  findNearby: string
  findingLocation: string
  
  // Homepage
  findSpaNearby: string
  searchPlaceholder: string
  
  // 404
  notFound: string
  pageNotFound: string
  pageNotFoundDescription: string
  backToHome: string
  clearLoginData: string
  ifYouHaveProblems: string
  viewSpaList: string
  viewBlog: string
  
  // Homepage additional
  orFindSpaNearLocation: string
  exploreSpecialOffers: string
  exploreSpecialOffersDesc: string
  bookOnlineAppointment: string
  bookOnlineAppointmentDesc: string
  chooseSpaByService: string
  chooseSpaByServiceDesc: string
  featuredSpas: string
  noSpasYet: string
  noAddress: string
  or: string
  
  // Customer menu
  accountInfo: string
  yourBookings: string
  vouchers: string
  favorites: string
  
  // Common actions
  cancel: string
  update: string
  updating: string
  submit: string
  submitting: string
  save: string
  delete: string
  edit: string
  close: string
  confirm: string
  
  // Account
  address: string
  enterAddress: string
  phone: string
  enterPhone: string
  name: string
  enterName: string
  dangerZone: string
  irreversibleActions: string
  deleteAccount: string
  
  // Spas page
  cannotLoadSpaList: string
  noSpaFound: string
  noSpaInRadius: string
  foundSpasNearby: string
  foundSpas: string
  noSpaWithService: string
  searchResults: string
  allSpas: string
  backToHomepage: string
  
  // Blog page
  blogTitle: string
  blogDescription: string
  noPostsYet: string
  noDate: string
  
  // About page
  aboutMOGGO: string
  aboutDescription: string
  ourMission: string
  ourVision: string
  whyChooseUs: string
  
  // Common messages
  success: string
  cannotLoad: string
  
  // Spas page additional
  enterSpaName: string
  spasNearYou: string
  foundSpasInRadius: string
  location: string
  searchResultsFor: string
  foundSpasWithService: string
  foundSpasCount: string
  noSpaFoundMessage: string
  
  // Bookings page
  loadingBookings: string
  yourBookingsTitle: string
  yourBookingsDescription: string
  noBookingsYet: string
  noBookingsDescription: string
  exploreNow: string
  spa: string
  service: string
  staff: string
  notSelected: string
  time: string
  status: string
  confirmed: string
  cancelled: string
  completed: string
  pending: string
  viewFeedback: string
  rate: string
  reschedule: string
  cancelBooking: string
  canceling: string
  confirmCancelBooking: string
  cancelSuccess: string
  cancelFailed: string
  
  // Vouchers page
  vouchersTitle: string
  vouchersDescription: string
  noVouchersYet: string
  noVouchersDescription: string
  backToHome: string
  expires: string
  use: string
  
  // Favorites page
  favoritesTitle: string
  favoritesDescription: string
  loadingFavorites: string
  noFavoritesYet: string
  noFavoritesDescription: string
  removeFromFavorites: string
  recentMonth: string
}

export const translations: Record<Language, Translations> = {
  VN: {
    // Navigation
    home: "Trang chủ",
    services: "Dịch vụ",
    blog: "Blog",
    about: "Giới thiệu",
    
    // Auth
    login: "Đăng nhập",
    signup: "Đăng ký",
    logout: "Đăng xuất",
    loggedOut: "Đã đăng xuất",
    loggedOutSuccess: "Bạn đã đăng xuất thành công",
    
    // Common
    loading: "Đang tải...",
    error: "Lỗi",
    search: "Tìm kiếm",
    findNearby: "Gần tôi",
    findingLocation: "Đang tìm...",
    
    // Homepage
    findSpaNearby: "Tìm spa gần bạn!",
    searchPlaceholder: "Nhập tên spa hoặc dịch vụ...",
    
    // 404
    notFound: "404",
    pageNotFound: "Trang không tìm thấy",
    pageNotFoundDescription: "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
    backToHome: "Về trang chủ",
    clearLoginData: "Đăng xuất và xóa dữ liệu đăng nhập",
    ifYouHaveProblems: "Nếu bạn đang gặp vấn đề, bạn có thể:",
    viewSpaList: "Xem danh sách spa",
    viewBlog: "Xem blog",
    
    // Homepage additional
    orFindSpaNearLocation: "tìm spa gần vị trí của bạn",
    exploreSpecialOffers: "Khám phá các ưu đãi đặc biệt",
    exploreSpecialOffersDesc: "Không gì tốt bất hơn ưu đãi tận nhận từ chúng tôi về spa",
    bookOnlineAppointment: "Đặt lịch hẹn trực tuyến",
    bookOnlineAppointmentDesc: "Đặt lịch hẹn nhanh chóng và dễ dàng, tận hưởng ngay",
    chooseSpaByService: "Chọn spa theo dịch vụ mong muốn",
    chooseSpaByServiceDesc: "Với mạng lưới spa rộng khắp sẽ giúp bạn dễ dàng tìm kiếm theo nhu cầu sở thích sử dụng dịch vụ mỗi lúc cần và phòng phù hợp đa dạng",
    featuredSpas: "Spa nổi bật",
    noSpasYet: "Chưa có spa nào",
    noAddress: "Chưa có địa chỉ",
    or: "Hoặc",
    
    // Customer menu
    accountInfo: "Thông tin tài khoản",
    yourBookings: "Đặt lịch của bạn",
    vouchers: "Voucher",
    favorites: "Danh sách yêu thích",
    
    // Common actions
    cancel: "Hủy",
    update: "Cập nhật",
    updating: "Đang cập nhật...",
    submit: "Gửi",
    submitting: "Đang gửi...",
    save: "Lưu",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    close: "Đóng",
    confirm: "Xác nhận",
    
    // Account
    address: "Địa chỉ",
    enterAddress: "Nhập địa chỉ",
    phone: "Số điện thoại",
    enterPhone: "Nhập số điện thoại",
    name: "Tên",
    enterName: "Nhập tên",
    dangerZone: "Vùng nguy hiểm",
    irreversibleActions: "Các hành động này không thể hoàn tác",
    deleteAccount: "Xóa tài khoản",
    
    // Spas page
    cannotLoadSpaList: "Không thể tải danh sách spa",
    noSpaFound: "Không tìm thấy spa",
    noSpaInRadius: "Không có spa nào trong bán kính 20km từ vị trí của bạn",
    foundSpasNearby: "Tìm thấy {count} spa gần bạn trong bán kính 20km",
    foundSpas: "Tìm thấy {count} spa có dịch vụ \"{keyword}\"",
    noSpaWithService: "Không có spa nào có dịch vụ chứa từ khóa \"{keyword}\"",
    searchResults: "Kết quả tìm kiếm",
    allSpas: "Tất cả spa",
    backToHomepage: "Quay lại trang chủ",
    
    // Blog page
    blogTitle: "Blog",
    blogDescription: "Khám phá những bài viết mới nhất về làm đẹp và chăm sóc sức khỏe",
    noPostsYet: "Chưa có bài viết nào",
    noDate: "Chưa có ngày",
    
    // About page
    aboutMOGGO: "Về MOGGO",
    aboutDescription: "Nền tảng đặt lịch spa hàng đầu Việt Nam, kết nối bạn với những dịch vụ làm đẹp chất lượng cao",
    ourMission: "Sứ mệnh của chúng tôi",
    ourVision: "Tầm nhìn của chúng tôi",
    whyChooseUs: "Tại sao chọn chúng tôi",
    
    // Common messages
    success: "Thành công",
    cannotLoad: "Không thể tải",
    
    // Spas page additional
    enterSpaName: "Nhập tên spa...",
    spasNearYou: "Spa gần bạn",
    foundSpasInRadius: "Tìm thấy {count} spa trong bán kính 20km từ vị trí của bạn",
    location: "Vị trí",
    searchResultsFor: "Kết quả tìm kiếm cho \"{query}\"",
    foundSpasWithService: "Tìm thấy {count} spa có dịch vụ liên quan",
    foundSpasCount: "Tìm thấy {count} spa",
    noSpaFoundMessage: "Không tìm thấy spa nào",
    
    // Bookings page
    loadingBookings: "Đang tải lịch hẹn...",
    yourBookingsTitle: "Đặt lịch của bạn",
    yourBookingsDescription: "Xem và quản lý tất cả các cuộc hẹn của bạn",
    noBookingsYet: "Bạn chưa có đặt lịch nào",
    noBookingsDescription: "Vô số spa với dịch vụ chuyên nghiệp và trải nghiệm hấp dẫn đang chờ bạn khám phá",
    exploreNow: "Khám phá ngay",
    spa: "Spa",
    service: "Dịch vụ",
    staff: "Nhân viên",
    notSelected: "Chưa chọn",
    time: "Thời gian",
    status: "Trạng thái",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
    completed: "Hoàn thành",
    pending: "Chờ xác nhận",
    viewFeedback: "Xem feedback",
    rate: "Đánh giá",
    reschedule: "Dời lịch",
    cancelBooking: "Hủy",
    canceling: "Đang hủy...",
    confirmCancelBooking: "Bạn có chắc chắn muốn hủy đặt lịch này?",
    cancelSuccess: "Đã hủy đặt lịch thành công",
    cancelFailed: "Hủy lịch hẹn thất bại",
    
    // Vouchers page
    vouchersTitle: "Voucher",
    vouchersDescription: "Các mã giảm giá của bạn",
    noVouchersYet: "Bạn chưa có voucher nào",
    noVouchersDescription: "Hãy trải nghiệm dịch vụ nhiều hơn nữa nhé!",
    backToHome: "Về trang chủ",
    expires: "Hết hạn",
    use: "Sử dụng",
    
    // Favorites page
    favoritesTitle: "Danh sách yêu thích",
    favoritesDescription: "Các spa mà bạn đã lưu",
    loadingFavorites: "Đang tải danh sách yêu thích...",
    noFavoritesYet: "Bạn chưa có spa yêu thích nào",
    noFavoritesDescription: "Về số spa với dịch vụ chuyên nghiệp và trải nghiệm hấp dẫn đang chờ bạn khám phá",
    removeFromFavorites: "Xóa khỏi yêu thích",
    recentMonth: "1 tháng gần đây",
  },
  US: {
    // Navigation
    home: "Home",
    services: "Services",
    blog: "Blog",
    about: "About",
    
    // Auth
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    loggedOut: "Logged Out",
    loggedOutSuccess: "You have successfully logged out",
    
    // Common
    loading: "Loading...",
    error: "Error",
    search: "Search",
    findNearby: "Near Me",
    findingLocation: "Finding...",
    
    // Homepage
    findSpaNearby: "Find spa near you!",
    searchPlaceholder: "Enter spa name or service...",
    
    // 404
    notFound: "404",
    pageNotFound: "Page Not Found",
    pageNotFoundDescription: "The page you are looking for does not exist or has been removed.",
    backToHome: "Back to Home",
    clearLoginData: "Logout and clear login data",
    ifYouHaveProblems: "If you are experiencing issues, you can:",
    viewSpaList: "View spa list",
    viewBlog: "View blog",
    
    // Homepage additional
    orFindSpaNearLocation: "find spa near your location",
    exploreSpecialOffers: "Explore Special Offers",
    exploreSpecialOffersDesc: "Nothing beats special offers delivered right to your door about spa",
    bookOnlineAppointment: "Book Online Appointment",
    bookOnlineAppointmentDesc: "Book appointments quickly and easily, enjoy right away",
    chooseSpaByService: "Choose spa by desired service",
    chooseSpaByServiceDesc: "With a wide network of spas, we help you easily search according to your needs and preferences for services whenever you need and diverse suitable rooms",
    featuredSpas: "Featured Spas",
    noSpasYet: "No spas yet",
    noAddress: "No address",
    or: "Or",
    
    // Customer menu
    accountInfo: "Account Information",
    yourBookings: "Your Bookings",
    vouchers: "Vouchers",
    favorites: "Favorites",
    
    // Common actions
    cancel: "Cancel",
    update: "Update",
    updating: "Updating...",
    submit: "Submit",
    submitting: "Submitting...",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    
    // Account
    address: "Address",
    enterAddress: "Enter address",
    phone: "Phone",
    enterPhone: "Enter phone",
    name: "Name",
    enterName: "Enter name",
    dangerZone: "Danger Zone",
    irreversibleActions: "These actions cannot be undone",
    deleteAccount: "Delete Account",
    
    // Spas page
    cannotLoadSpaList: "Cannot load spa list",
    noSpaFound: "No spa found",
    noSpaInRadius: "No spas found within 20km radius from your location",
    foundSpasNearby: "Found {count} spas near you within 20km radius",
    foundSpas: "Found {count} spas with service \"{keyword}\"",
    noSpaWithService: "No spas found with service containing keyword \"{keyword}\"",
    searchResults: "Search Results",
    allSpas: "All Spas",
    backToHomepage: "Back to Homepage",
    
    // Blog page
    blogTitle: "Blog",
    blogDescription: "Discover the latest articles about beauty and health care",
    noPostsYet: "No posts yet",
    noDate: "No date",
    
    // About page
    aboutMOGGO: "About MOGGO",
    aboutDescription: "Vietnam's leading spa booking platform, connecting you with high-quality beauty services",
    ourMission: "Our Mission",
    ourVision: "Our Vision",
    whyChooseUs: "Why Choose Us",
    
    // Common messages
    success: "Success",
    cannotLoad: "Cannot load",
    
    // Spas page additional
    enterSpaName: "Enter spa name...",
    spasNearYou: "Spas Near You",
    foundSpasInRadius: "Found {count} spas within 20km radius from your location",
    location: "Location",
    searchResultsFor: "Search Results for \"{query}\"",
    foundSpasWithService: "Found {count} spas with related services",
    foundSpasCount: "Found {count} spas",
    noSpaFoundMessage: "No spas found",
    
    // Bookings page
    loadingBookings: "Loading bookings...",
    yourBookingsTitle: "Your Bookings",
    yourBookingsDescription: "View and manage all your appointments",
    noBookingsYet: "You don't have any bookings yet",
    noBookingsDescription: "Countless spas with professional services and exciting experiences are waiting for you to explore",
    exploreNow: "Explore Now",
    spa: "Spa",
    service: "Service",
    staff: "Staff",
    notSelected: "Not Selected",
    time: "Time",
    status: "Status",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    pending: "Pending",
    viewFeedback: "View Feedback",
    rate: "Rate",
    reschedule: "Reschedule",
    cancelBooking: "Cancel",
    canceling: "Canceling...",
    confirmCancelBooking: "Are you sure you want to cancel this booking?",
    cancelSuccess: "Booking cancelled successfully",
    cancelFailed: "Failed to cancel booking",
    
    // Vouchers page
    vouchersTitle: "Vouchers",
    vouchersDescription: "Your discount codes",
    noVouchersYet: "You don't have any vouchers yet",
    noVouchersDescription: "Experience more services!",
    backToHome: "Back to Home",
    expires: "Expires",
    use: "Use",
    
    // Favorites page
    favoritesTitle: "Favorites",
    favoritesDescription: "Spas you have saved",
    loadingFavorites: "Loading favorites...",
    noFavoritesYet: "You don't have any favorite spas yet",
    noFavoritesDescription: "Countless spas with professional services and exciting experiences are waiting for you to explore",
    removeFromFavorites: "Remove from favorites",
    recentMonth: "Recent month",
  },
}

