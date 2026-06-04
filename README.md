# 慌慌歌曲查詢網站

這是一個可部署到 GitHub Pages 的靜態網站，會從 Google 試算表讀取歌名與歌手資料，並提供即時搜尋、歌手篩選與複製功能。

## 使用方式

1. 將 `index.html`、`style.css`、`app.js` 上傳到 GitHub Repository。
2. 到 GitHub Repository 的 Settings → Pages。
3. Source 選擇 `Deploy from a branch`，Branch 選 `main / root`。
4. 等待 GitHub Pages 產生網址。

## Google 試算表格式

第一列請放欄位名稱：

| 歌名 | 歌手 |

後續每一列放一首歌。

## 重要設定

Google 試算表必須設為：知道連結的使用者可檢視。

若要換成其他試算表，請修改 `app.js` 內的：

```js
const SHEET_ID = '你的試算表ID';
const SHEET_GID = '0';
```
