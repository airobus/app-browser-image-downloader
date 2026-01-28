/* ========================================
   图片预览模块 - imagePreview.js
   负责图片预览功能
   ======================================== */

import { state } from './state.js';
import { formatFileSize } from './utils.js';

/**
 * 打开预览
 * @param {number} index - 图片索引
 */
export function openPreview(index) {
    state.currentPreviewIndex = index;
    updatePreview();
    const modal = document.getElementById('previewModal');
    modal.classList.add('show');
}

/**
 * 关闭预览
 */
export function closePreview() {
    const modal = document.getElementById('previewModal');
    modal.classList.remove('show');
}

/**
 * 更新预览内容
 */
export function updatePreview() {
    const img = state.allImages[state.currentPreviewIndex];
    if (!img) return;

    document.getElementById('previewImage').src = img.url;
    document.getElementById('previewDimension').textContent = `${img.width} x ${img.height} px`;
    document.getElementById('previewSize').textContent = formatFileSize(img.size);
    document.getElementById('previewUrl').textContent = img.url;

    // 更新导航按钮状态
    document.querySelector('.prev-btn').style.display = state.currentPreviewIndex > 0 ? 'block' : 'none';
    document.querySelector('.next-btn').style.display = state.currentPreviewIndex < state.allImages.length - 1 ? 'block' : 'none';
}

/**
 * 导航到上一张
 */
export function navigatePrev() {
    if (state.currentPreviewIndex > 0) {
        state.currentPreviewIndex--;
        updatePreview();
    }
}

/**
 * 导航到下一张
 */
export function navigateNext() {
    if (state.currentPreviewIndex < state.allImages.length - 1) {
        state.currentPreviewIndex++;
        updatePreview();
    }
}

/**
 * 初始化预览事件监听器
 */
export function initPreviewListeners() {
    // 关闭按钮
    document.querySelector('.close').addEventListener('click', closePreview);

    // 导航按钮
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
}
