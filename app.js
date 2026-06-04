const SHEET_ID = '1-4mY86ruT2HnTWpPI9MJ9MYPWVTE_Yi3Zoe3PZIMSbs';
const SHEET_GID = '0';
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

const fallbackSongs = [
  { title: '人質', artist: '張惠妹' }, { title: '身後', artist: '張惠妹' },
  { title: '真實', artist: '張惠妹' }, { title: '記得', artist: '張惠妹' },
  { title: '摯友', artist: 'A-Lin' }, { title: '四季', artist: 'A-Lin' },
  { title: '情歌', artist: '梁靜茹' }, { title: '慢冷', artist: '梁靜茹' },
  { title: '墜落', artist: '蔡健雅' }, { title: '紅色高跟鞋', artist: '蔡健雅' },
  { title: '妥協', artist: '蔡依林' }, { title: '倒帶', artist: '蔡依林' },
  { title: '倒數', artist: '鄧紫棋' }, { title: '光年之外', artist: '鄧紫棋' },
  { title: '遇見', artist: '孫燕姿' }, { title: '隱形的翅膀', artist: '張韶涵' },
  { title: '小幸運', artist: '田馥甄' }
];

let songs = [];
let filteredSongs = [];

const $ = (selector) => document.querySelector(selector);
const songList = $('#songList');
const template = $('#songCardTemplate');
const searchInput = $('#searchInput');
const artistFilter = $('#artistFilter');
const clearBtn = $('#clearBtn');
const statusBox = $('#statusBox');
const songCount = $('#songCount');
const updatedAt = $('#updatedAt');
const resultText = $('#resultText');

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function showStatus(message, type = 'info') {
  statusBox.textContent = message;
  statusBox.className = `status show ${type === 'error' ? 'error' : ''}`;
}

function hideStatus() {
  statusBox.className = 'status';
}

async function loadSongs() {
  showStatus('正在同步 Google 試算表資料…');
  try {
    const response = await fetch(GVIZ_URL);
    if (!response.ok) throw new Error('Google Sheet 無法讀取');
    const text = await response.text();
    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = json.table.rows || [];

    songs = rows.map((row) => ({
      title: row.c?.[0]?.v || '',
      artist: row.c?.[1]?.v || ''
    })).filter((song) => song.title && song.artist);

    if (!songs.length) throw new Error('試算表沒有可用歌曲資料');
    hideStatus();
  } catch (error) {
    songs = fallbackSongs;
    showStatus('目前無法即時同步 Google 試算表，已先載入備用範例資料。請確認試算表已開啟「知道連結的使用者可檢視」。', 'error');
  }

  songCount.textContent = songs.length;
  updatedAt.textContent = `已更新 ${new Date().toLocaleString('zh-TW', { hour12: false })}`;
  buildArtistFilter();
  applyFilters();
}

function buildArtistFilter() {
  const artists = [...new Set(songs.map((song) => song.artist))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  artistFilter.innerHTML = '<option value="">全部歌手</option>';
  artists.forEach((artist) => {
    const option = document.createElement('option');
    option.value = artist;
    option.textContent = artist;
    artistFilter.appendChild(option);
  });
}

function applyFilters() {
  const keyword = normalize(searchInput.value);
  const artist = artistFilter.value;

  filteredSongs = songs.filter((song) => {
    const matchKeyword = !keyword || normalize(`${song.title} ${song.artist}`).includes(keyword);
    const matchArtist = !artist || song.artist === artist;
    return matchKeyword && matchArtist;
  });

  renderSongs(filteredSongs);
}

function renderSongs(list) {
  songList.innerHTML = '';
  resultText.textContent = `${list.length} / ${songs.length} 首`;

  if (!list.length) {
    songList.innerHTML = '<div class="empty">沒有找到符合的歌曲，請換一個關鍵字試試。</div>';
    return;
  }

  list.forEach((song) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.song-title').textContent = song.title;
    node.querySelector('.song-artist').textContent = song.artist;
    node.querySelector('.copy-btn').addEventListener('click', async (event) => {
      await navigator.clipboard.writeText(`${song.title} - ${song.artist}`);
      event.currentTarget.textContent = '已複製';
      setTimeout(() => (event.currentTarget.textContent = '複製'), 1000);
    });
    songList.appendChild(node);
  });
}

searchInput.addEventListener('input', applyFilters);
artistFilter.addEventListener('change', applyFilters);
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  artistFilter.value = '';
  applyFilters();
  searchInput.focus();
});

loadSongs();
