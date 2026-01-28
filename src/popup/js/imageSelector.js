/* ========================================
   图片选择模块 - imageSelector.js
   负责图片选择逻辑
   ======================================== */

import { state } from './state.js';
import { updateSelectedCount, showStatus, hideStatus } from './ui.js';

/**
 * 切换单张图片的选择状态
 * @param {number} index - 图片索引
 * @param {boolean} selected - 是否选中
 */
export function toggleSelection(index, selected) {
    const card = document.querySelector(`.img-card[data-index="${index}"]`);

    if (selected) {
        state.selectedImages.add(index);
        card.classList.add('selected');
    } else {
        state.selectedImages.delete(index);
        card.classList.remove('selected');
    }

    updateSelectedCount();
}

/**
 * 全选/取消全选
 */
export function toggleSelectAll() {
    const allSelected = state.selectedImages.size === state.allImages.length;
    const checkboxes = document.querySelectorAll('.checkbox');

    if (allSelected) {
        // 取消全选
        state.selectedImages.clear();
        checkboxes.forEach(cb => cb.checked = false);
        document.querySelectorAll('.img-card').forEach(card => card.classList.remove('selected'));
    } else {
        // 全选
        state.allImages.forEach((img, index) => state.selectedImages.add(index));
        checkboxes.forEach(cb => cb.checked = true);
        document.querySelectorAll('.img-card').forEach(card => card.classList.add('selected'));
    }

    updateSelectedCount();
}

/**
 * 过滤大图（≥500x500）
 * @param {number} minSize - 最小尺寸，默认 500
 */
export function filterLargeImages(minSize = 500) {
    state.selectedImages.clear();
    const checkboxes = document.querySelectorAll('.checkbox');

    state.allImages.forEach((img, index) => {
        const isLarge = img.width >= minSize && img.height >= minSize;
        const card = document.querySelector(`.img-card[data-index="${index}"]`);

        if (isLarge) {
            state.selectedImages.add(index);
            checkboxes[index].checked = true;
            card.classList.add('selected');
        } else {
            checkboxes[index].checked = false;
            card.classList.remove('selected');
        }
    });

    updateSelectedCount();
    showStatus(`已选择 ${state.selectedImages.size} 张大图 (>=${minSize}x${minSize})`, 'info');
    setTimeout(() => hideStatus(), 2000);
}

/**
 * 清除所有选择
 */
export function clearSelection() {
    state.selectedImages.clear();
    document.querySelectorAll('.checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.img-card').forEach(card => card.classList.remove('selected'));
    updateSelectedCount();
}
