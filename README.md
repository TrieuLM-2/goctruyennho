# Mê đọc truyện chữ 📚

Nền tảng đọc truyện online hoàn chỉnh với hỗ trợ song ngữ Việt-Anh, được tối ưu hóa để triển khai trên GitHub Pages.

## ✨ Tính năng chính

### 🏠 Trang chủ (Homepage)
- Header với logo, navigation menu, search bar và theme toggle
- Hero section với tagline và CTA buttons
- Grid layout hiển thị sách với cover, title, author, rating, và action buttons
- Sidebar với danh mục: Hoàn thành, Đang cập nhật, Thể loại
- Filter và sort: Mới nhất, Đánh giá cao, Lượt đọc nhiều
- Pagination với lazy loading
- Responsive design (mobile/tablet/desktop)
- Dark/Light/Sepia theme

### 📖 Trang chi tiết sách (Book Detail Page)
- Book cover lớn với metadata đầy đủ
- Synopsis/mô tả chi tiết
- Rating trung bình (tính từ tất cả đánh giá)
- Progress indicator (tiến độ đọc)
- Danh sách chapter đầy đủ với trạng thái đã đọc/chưa đọc
- **All Comments Section**: Tổng hợp tất cả bình luận từ mọi chapter
- Related books recommendations

### 📚 Trang đọc (Reading Page)
- Giao diện đọc clean, không phân tâm
- **Floating Settings Sidebar** với:
  - Font selection (Nunito, Georgia, Arial, Times New Roman)
  - Font size slider (80-200%)
  - Line spacing slider (1.0-2.5)
  - Text alignment (Left, Center, Justify)
  - Theme modes: Sáng, Tối, Sepia
  - **Language modes**: 🇻🇳 Tiếng Việt only / 🇬🇧 English only / 🌐 Song ngữ (bilingual)
- Progress bar hiển thị % hoàn thành chapter
- Auto-save vị trí đọc (localStorage)
- Previous/Next chapter navigation
- Chapter comments section
- **Rating module** (chỉ hiện ở chapter cuối)

### ⚙️ Admin Dashboard
- Protected login page (admin/admin123)
- Dashboard statistics
- Hướng dẫn quản lý sách qua file JSON
- Popular books table
- Instructions cho 3 phương pháp upload chapter

## 🚀 Cấu trúc Project

```
goctruyennho/
├── index.html              # Trang chủ
├── book.html               # Trang chi tiết sách
├── read.html               # Trang đọc
├── admin.html              # Admin dashboard
├── css/
│   ├── main.css            # Core styles & theme system
│   ├── components.css      # Reusable components
│   └── responsive.css      # Responsive breakpoints
├── js/
│   ├── app.js              # Homepage logic
│   ├── theme.js            # Theme management
│   ├── reader.js           # Reading page functionality
│   ├── data-manager.js     # Data loading & caching
│   └── utils.js            # Helper functions
├── data/
│   ├── books.json          # Books metadata
│   ├── chapters.json       # Chapter content (bilingual)
│   ├── comments.json       # User comments
│   └── users.json          # User data
└── assets/
    ├── covers/             # Book cover images
    ├── icons/              # UI icons
    ├── fonts/              # Custom fonts
    └── avatars/            # User avatars
```

## 📋 Cách sử dụng

### Chạy local
1. Clone repository
```bash
git clone <your-repo-url>
cd goctruyennho
```

2. Chạy với live server (VS Code extension) hoặc bất kỳ HTTP server nào
```bash
# Hoặc dùng Python
python -m http.server 8000

# Hoặc Node.js
npx serve
```

3. Truy cập `http://localhost:8000` (hoặc port tương ứng)

### Deploy lên GitHub Pages
1. Push code lên GitHub repository
2. Vào Settings → Pages
3. Chọn branch `main` và folder `/root`
4. Save và đợi deploy
5. Truy cập `https://<username>.github.io/<repo-name>/`

## 📚 Quản lý nội dung

### Thêm sách mới
1. Thêm ảnh bìa vào `assets/covers/`
2. Cập nhật `data/books.json`:
```json
{
  "id": "book_xxx",
  "title": "Tên sách",
  "author": "Tác giả",
  "cover": "./assets/covers/yourcover.jpg",
  "description": "Mô tả...",
  "genres": ["Genre1", "Genre2"],
  "avgRating": 0,
  "totalRatings": 0,
  "status": "ongoing",
  "chapters": [],
  "views": 0,
  "dateAdded": "2024-01-01"
}
```

### Thêm chapter mới
Cập nhật `data/chapters.json` với cấu trúc bilingual:
```json
{
  "id": "chap_book_xxx_001",
  "bookId": "book_xxx",
  "chapterNum": 1,
  "title": "Chapter Title",
  "contentVN": [
    "Đoạn văn tiếng Việt 1",
    "Đoạn văn tiếng Việt 2"
  ],
  "contentEN": [
    "English paragraph 1",
    "English paragraph 2"
  ],
  "uploadDate": "2024-01-01",
  "isFinal": false
}
```

## 🎨 Theme System
Website hỗ trợ 3 theme:
- ☀️ **Light Mode**: Nền sáng, dễ đọc ban ngày
- 🌙 **Dark Mode**: Nền tối, dễ chịu cho mắt ban đêm
- 📄 **Sepia Mode**: Tone màu ấm, giống sách giấy

Theme được lưu trong localStorage và tự động áp dụng khi quay lại.

## 🌐 Bilingual Reading
Hỗ trợ 3 chế độ hiển thị:
1. **Tiếng Việt only**: Chỉ hiện nội dung tiếng Việt
2. **English only**: Chỉ hiện nội dung tiếng Anh
3. **Song ngữ**: Hiện luân phiên đoạn tiếng Việt và tiếng Anh

Thiết lập được lưu và áp dụng cho tất cả chapter.

## 📱 Responsive Design
- **Mobile** (< 768px): 1 cột, hamburger menu, touch-friendly
- **Tablet** (768-1024px): 2-3 cột, layout cân đối
- **Desktop** (> 1024px): 4+ cột, full sidebar

## 🔒 Admin Access
- URL: `admin.html`
- Username: `admin`
- Password: `admin123`

**Lưu ý**: Đây là demo authentication đơn giản. Trong production, cần implement backend authentication thật.

## 🛠️ Tech Stack
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox
- **JavaScript**: Vanilla JS, ES6+
- **localStorage**: User preferences & reading progress
- **JSON**: Data storage

## 📦 Sample Data
Website đã bao gồm 5 cuốn sách mẫu:
1. **Red, White & Royal Blue** - Casey McQuiston
2. **The Seven Husbands of Evelyn Hugo** - Taylor Jenkins Reid
3. **The Midnight Library** - Matt Haig
4. **Normal People** - Sally Rooney
5. **The Song of Achilles** - Madeline Miller

Tất cả đều có nội dung song ngữ Việt-Anh.

## ⚠️ Limitations (GitHub Pages)
Do GitHub Pages là static hosting:
- Comments và ratings được lưu trong JSON (không real-time update)
- Admin functions chỉ là UI demo (không thể thực sự edit data trên server)
- Để có full functionality, cần backend API (Firebase, Supabase, custom server)

## 🔄 Future Enhancements
- [ ] Backend API integration
- [ ] Real-time comments và ratings
- [ ] User registration và authentication
- [ ] Bookmark và highlight text
- [ ] Reading statistics dashboard
- [ ] Mobile app (PWA)
- [ ] Epub file upload support

## 📄 License
MIT License - Free to use and modify

## 👥 Credits
Developed as a complete bilingual reading platform for Vietnamese and English learners.

---

**Chúc bạn đọc truyện vui vẻ! 📖✨**
