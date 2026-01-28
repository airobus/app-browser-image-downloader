/* ========================================
   UI 模块 - ui.js
   负责 UI 渲染和更新
   ======================================== */

import { state, getSelectedCount } from './state.js';
import { formatFileSize } from './utils.js';
import { fetchImageSize } from './imageScanner.js';
import { toggleSelection } from './imageSelector.js';
import { openPreview } from './imagePreview.js';

/**
 * 显示图片网格
 * @param {Array} images - 图片列表
 */
export function displayImages(images) {
    const gallery = document.getElementById('gallery');
    const totalCount = document.getElementById('totalCount');

    totalCount.textContent = images.length;

    if (images.length === 0) {
        gallery.innerHTML = '<div class="loading">未找到图片</div>';
        return;
    }

    gallery.innerHTML = '';

    images.forEach((img, index) => {
        const card = createImageCard(img, index);
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

/**
 * 创建图片卡片元素
 * @param {Object} img - 图片数据
 * @param {number} index - 索引
 * @returns {HTMLElement}
 */
function createImageCard(img, index) {
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

    // 单击切换选择
    card.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') return;
        const checkbox = card.querySelector('.checkbox');
        checkbox.checked = !checkbox.checked;
        toggleSelection(index, checkbox.checked);
    });

    // 复选框变化
    card.querySelector('.checkbox').addEventListener('change', (e) => {
        toggleSelection(index, e.target.checked);
    });

    return card;
}

/**
 * 更新选中计数
 */
export function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = getSelectedCount();
}

/**
 * 显示状态消息
 * @param {string} message - 消息内容
 * @param {string} type - 类型：success, warning, info
 */
export function showStatus(message, type = 'info') {
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

/**
 * 隐藏状态消息
 */
export function hideStatus() {
    document.getElementById('status').style.display = 'none';
}
