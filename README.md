# 🍬 Hi-Chew 電流急急棒遊戲

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

一個基於 Vue 3 + Vite 的現代化電流急急棒遊戲，支援多種糖果角色和關卡挑戰！

</div>

## ✨ 遊戲特色

### 🎮 核心玩法
- **精確拖曳控制**：優化的拖曳系統，元件緊跟滑鼠/手指移動
- **多關卡挑戰**：A、B 兩個不同難度的關卡設計
- **糖果角色**：葡萄和草莓兩種可愛的糖果角色可選
- **生命值系統**：3 條生命，碰撞後自動重置到起點
- **即時計分**：根據存活時間和完成速度計分

### 🎨 視覺效果
- **SVG 路徑設計**：基於複雜 SVG 路徑的精確碰撞檢測
- **現代化 UI**：漸層背景、毛玻璃效果、流暢動畫
- **響應式設計**：完美適配桌面、平板、手機各種設備
- **視覺反饋**：碰撞閃電效果、震動動畫、音效提示

### 🔧 技術亮點
- **高性能拖曳**：使用 requestAnimationFrame 優化，60fps 流暢體驗
- **智能碰撞檢測**：多層級檢測算法，平衡精度與性能
- **觸控優化**：完整的觸控手勢支援，手機體驗流暢
- **音效系統**：背景音樂、碰撞音效、成功音效

## 🚀 快速開始

### 環境要求
- Node.js 16+ 
- npm 或 yarn

### 安裝與運行

```bash
# 克隆專案
git clone <repository-url>
cd hi-chew-game

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 🎯 遊戲玩法

### 基本操作
1. **選擇角色**：在首頁選擇喜愛的糖果角色（葡萄/草莓）
2. **選擇關卡**：選擇難度等級（A 關卡/ B 關卡）
3. **拖曳移動**：使用滑鼠或手指拖曳糖果沿著路徑移動
4. **避免碰撞**：小心不要碰到路徑邊界，否則會失去生命
5. **到達終點**：成功到達終點即可完成關卡

### 遊戲規則
- **生命值**：每關開始時有 3 條生命
- **碰撞懲罰**：碰到路徑邊界會失去 1 條生命並重置到起點
- **勝利條件**：成功到達終點區域
- **失敗條件**：生命值歸零
- **計分系統**：根據存活時間計分，每 0.1 秒 +1 分

## 🎮 關卡設計

### A 關卡 - 入門級
- **路徑特點**：較為平緩的曲線路徑
- **難度**：適合新手練習
- **完成時間**：約 30-60 秒

### B 關卡 - 進階級
- **路徑特點**：複雜的轉折和狹窄通道
- **難度**：需要精確控制
- **完成時間**：約 60-120 秒

## 🛠️ 技術架構

### 前端技術棧
```
Vue 3 (Composition API)
├── Vite (建置工具)
├── Vue Router (路由管理)
├── CSS3 (樣式與動畫)
└── SVG (路徑與圖形)
```

### 核心功能模組

#### 拖曳系統
- **事件處理**：mousedown/mousemove/mouseup + touchstart/touchmove/touchend
- **座標轉換**：SVG 座標與螢幕座標的精確轉換
- **性能優化**：requestAnimationFrame + 座標緩存機制

#### 碰撞檢測
- **多層級檢測**：基礎檢測 + 關鍵點額外檢測
- **精確計算**：基於 SVG 路徑的點到線距離計算
- **性能平衡**：50 個檢測點，12px 間距，30ms 檢測頻率

#### 音效系統
- **背景音樂**：循環播放的 BGM
- **音效反饋**：碰撞、成功、失敗音效
- **自動播放**：用戶交互後自動啟用音效

## 📱 設備支援

| 平台 | 支援狀態 | 備註 |
|------|----------|------|
| 🖥️ 桌面瀏覽器 | ✅ 完全支援 | Chrome, Firefox, Safari, Edge |
| 📱 手機瀏覽器 | ✅ 完全支援 | iOS Safari, Android Chrome |
| 📱 平板電腦 | ✅ 完全支援 | iPad, Android 平板 |
| 💻 觸控筆電 | ✅ 完全支援 | Windows 觸控筆電 |

## 🎨 自訂設定

### 遊戲參數調整
```javascript
// 碰撞檢測參數
const blockSize = 45;        // 糖果大小
const pathWidth = 1;         // 路徑寬度
const tolerance = 23;        // 碰撞容錯範圍

// 檢測頻率設定
const collisionCheckInterval = 30;  // 碰撞檢測間隔(ms)
const maxDetectionPoints = 50;      // 最大檢測點數
const detectionSpacing = 12;        // 檢測點間距(px)
```

### 視覺樣式自訂
```css
/* 糖果樣式 */
.player {
  filter: drop-shadow(0 0 8px rgba(255,107,107,0.6));
  transition: none; /* 移除過渡以提升拖曳流暢度 */
}

/* 路徑樣式 */
.path-1, .path-2, .path-3, .path-4 {
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.3));
}
```

## 🔧 開發指南

### 專案結構
```
src/
├── assets/           # 靜態資源
│   ├── images/      # 遊戲圖片
│   └── mp3/         # 音效文件
├── components/       # Vue 組件
├── views/           # 頁面組件
│   ├── Home.vue     # 首頁
│   └── Game.vue     # 遊戲頁面
├── router/          # 路由配置
└── main.js          # 應用入口
```

### 添加新關卡
1. 在 `Game.vue` 的 `levelConfig` 中添加新關卡配置
2. 準備對應的 SVG 路徑數據
3. 設定起點、終點和路徑參數

### 添加新角色
1. 在 `assets/images/` 中添加角色圖片
2. 在 `setCandyImage()` 方法中添加新角色邏輯
3. 更新首頁的角色選擇界面

## 🐛 已知問題

- [ ] 在某些低端設備上可能出現輕微的拖曳延遲
- [ ] 音效在某些瀏覽器中需要用戶交互才能播放
- [ ] 極小螢幕設備上的 UI 可能需要進一步優化

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🙏 致謝

- Vue.js 團隊提供的優秀框架
- Vite 團隊提供的高效建置工具
- 所有貢獻者和測試用戶

---

<div align="center">

**享受遊戲的樂趣！** 🍬⚡🎮

Made with ❤️ by [Your Name]

</div>