let allImages = [];
let selectedImages = new Set();
let currentPreviewIndex = 0;

async function loadImages() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractImages
  });

  allImages = results[0].result;
  displayImages(allImages);
}

function extractImages() {
  const images = [];
  const imgElements = document.querySelectorAll('img');

  imgElements.forEach((img, index) => {
    if (img.src && !img.src.startsWith('data:')) {
      images.push({
        url: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: null, // 稍后异步获取
        index: index
      });
    }
  });

  return images;
}

// 获取图片文件大小
async function fetchImageSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    return contentLength ? parseInt(contentLength) : null;
  } catch (error) {
    return null;
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes) return '未知';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function displayImages(images) {
  const gallery = document.getElementById('gallery');
  const totalCount = document.getElementById('totalCount');

  totalCount.textContent = images.length;

  if (images.length === 0) {
    gallery.innerHTML = '<div class="loading">未找到图片</div>';
    return;
  }

  gallery.innerHTML = '';

  images.forEach((img, index) => {
    const card = document.createElement('div');
    card.className = 'img-card';
    card.dataset.index = index;

    const sizeText = img.size ? formatFileSize(img.size) : '获取中...';
    card.innerHTML = `
      <input type="checkbox" class="checkbox" data-index="${index}">
      <img src="${img.url}" alt="图片 ${index + 1}">
      <div class="info">${img.width}x${img.height}</div>
      <div class="size-info">${sizeText}</div>
    `;

    // 图片加载错误处理
    const imgElement = card.querySelector('img');
    imgElement.addEventListener('error', () => {
      imgElement.style.opacity = '0.3';
      imgElement.alt = '加载失败';
      card.querySelector('.info').textContent = '加载失败';
      card.querySelector('.info').style.color = '#f44336';
    });

    // 双击打开预览
    card.addEventListener('dblclick', () => {
      openPreview(index);
    });

    card.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      const checkbox = card.querySelector('.checkbox');
      checkbox.checked = !checkbox.checked;
      toggleSelection(index, checkbox.checked);
    });

    card.querySelector('.checkbox').addEventListener('change', (e) => {
      toggleSelection(index, e.target.checked);
    });

    gallery.appendChild(card);

    // 异步获取文件大小
    if (!img.size) {
      fetchImageSize(img.url).then(size => {
        img.size = size;
        const sizeInfo = card.querySelector('.size-info');
        if (sizeInfo) {
          sizeInfo.textContent = formatFileSize(size);
        }
      });
    }
  });
}

function toggleSelection(index, selected) {
  const card = document.querySelector(`.img-card[data-index="${index}"]`);

  if (selected) {
    selectedImages.add(index);
    card.classList.add('selected');
  } else {
    selectedImages.delete(index);
    card.classList.remove('selected');
  }

  updateSelectedCount();
}

function updateSelectedCount() {
  document.getElementById('selectedCount').textContent = selectedImages.size;
}

document.getElementById('selectAll').addEventListener('click', () => {
  const allSelected = selectedImages.size === allImages.length;
  const checkboxes = document.querySelectorAll('.checkbox');

  if (allSelected) {
    selectedImages.clear();
    checkboxes.forEach(cb => cb.checked = false);
    document.querySelectorAll('.img-card').forEach(card => card.classList.remove('selected'));
  } else {
    allImages.forEach((img, index) => selectedImages.add(index));
    checkboxes.forEach(cb => cb.checked = true);
    document.querySelectorAll('.img-card').forEach(card => card.classList.add('selected'));
  }

  updateSelectedCount();
});

document.getElementById('download').addEventListener('click', async () => {
  if (selectedImages.size === 0) {
    showStatus('请先选择要下载的图片', 'warning');
    return;
  }

  showStatus(`开始下载 ${selectedImages.size} 张图片...`, 'info');

  const selectedArray = Array.from(selectedImages).sort((a, b) => a - b);
  let successCount = 0;

  for (const index of selectedArray) {
    const img = allImages[index];

    // 从URL中提取文件扩展名
    let ext = '.jpg'; // 默认扩展名
    try {
      const urlPath = new URL(img.url).pathname;
      const match = urlPath.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
      if (match) {
        ext = match[0].toLowerCase();
      }
    } catch (e) {
      console.log('无法解析URL:', img.url);
    }

    const filename = `image_${index + 1}_${Date.now()}${ext}`;

    try {
      await chrome.runtime.sendMessage({
        action: 'download',
        url: img.url,
        filename: filename
      });
      successCount++;
      showStatus(`正在下载 ${successCount}/${selectedImages.size}...`, 'info');
      await sleep(300);
    } catch (error) {
      console.error('下载失败:', img.url, error);
    }
  }

  showStatus(`成功下载 ${successCount} 张图片!`, 'success');
  setTimeout(() => hideStatus(), 3000);
});

document.getElementById('filterSize').addEventListener('click', () => {
  selectedImages.clear();
  const checkboxes = document.querySelectorAll('.checkbox');

  allImages.forEach((img, index) => {
    const isLarge = img.width >= 500 && img.height >= 500;
    if (isLarge) {
      selectedImages.add(index);
      checkboxes[index].checked = true;
      document.querySelector(`.img-card[data-index="${index}"]`).classList.add('selected');
    } else {
      checkboxes[index].checked = false;
      document.querySelector(`.img-card[data-index="${index}"]`).classList.remove('selected');
    }
  });

  updateSelectedCount();
  showStatus(`已选择 ${selectedImages.size} 张大图 (>=500x500)`, 'info');
  setTimeout(() => hideStatus(), 2000);
});

document.getElementById('clearSelection').addEventListener('click', () => {
  selectedImages.clear();
  document.querySelectorAll('.checkbox').forEach(cb => cb.checked = false);
  document.querySelectorAll('.img-card').forEach(card => card.classList.remove('selected'));
  updateSelectedCount();
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.display = 'block';

  const colors = {
    success: { bg: '#d4edda', border: '#28a745', color: '#155724' },
    warning: { bg: '#fff3cd', border: '#ffc107', color: '#856404' },
    info: { bg: '#d1ecf1', border: '#17a2b8', color: '#0c5460' }
  };

  const color = colors[type] || colors.info;
  status.style.background = color.bg;
  status.style.borderLeftColor = color.border;
  status.style.color = color.color;
}

function hideStatus() {
  document.getElementById('status').style.display = 'none';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 预览功能 ====================

// 打开预览
function openPreview(index) {
  currentPreviewIndex = index;
  updatePreview();
  const modal = document.getElementById('previewModal');
  modal.classList.add('show');
}

// 关闭预览
function closePreview() {
  const modal = document.getElementById('previewModal');
  modal.classList.remove('show');
}

// 更新预览内容
function updatePreview() {
  const img = allImages[currentPreviewIndex];
  if (!img) return;

  document.getElementById('previewImage').src = img.url;
  document.getElementById('previewDimension').textContent = `${img.width} x ${img.height} px`;
  document.getElementById('previewSize').textContent = formatFileSize(img.size);
  document.getElementById('previewUrl').textContent = img.url;

  // 更新导航按钮状态
  document.querySelector('.prev-btn').style.display = currentPreviewIndex > 0 ? 'block' : 'none';
  document.querySelector('.next-btn').style.display = currentPreviewIndex < allImages.length - 1 ? 'block' : 'none';
}

// 导航到上一张
function navigatePrev() {
  if (currentPreviewIndex > 0) {
    currentPreviewIndex--;
    updatePreview();
  }
}

// 导航到下一张
function navigateNext() {
  if (currentPreviewIndex < allImages.length - 1) {
    currentPreviewIndex++;
    updatePreview();
  }
}

// 事件监听
document.querySelector('.close').addEventListener('click', closePreview);
document.querySelector('.prev-btn').addEventListener('click', navigatePrev);
document.querySelector('.next-btn').addEventListener('click', navigateNext);

// 点击背景关闭
document.getElementById('previewModal').addEventListener('click', (e) => {
  if (e.target.id === 'previewModal') {
    closePreview();
  }
});

// 键盘导航
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('previewModal');
  if (!modal.classList.contains('show')) return;

  if (e.key === 'Escape') {
    closePreview();
  } else if (e.key === 'ArrowLeft') {
    navigatePrev();
  } else if (e.key === 'ArrowRight') {
    navigateNext();
  }
});

loadImages();
