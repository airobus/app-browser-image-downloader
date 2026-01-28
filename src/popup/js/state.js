/* ========================================
   状态管理模块 - state.js
   集中管理应用状态
   ======================================== */

// 应用状态
export const state = {
    allImages: [],           // 所有扫描到的图片
    selectedImages: new Set(), // 已选择的图片索引
    currentPreviewIndex: 0   // 当前预览的图片索引
};

/**
 * 重置状态
 */
export function resetState() {
    state.allImages = [];
    state.selectedImages.clear();
    state.currentPreviewIndex = 0;
}

/**
 * 获取已选择的图片数量
 * @returns {number}
 */
export function getSelectedCount() {
    return state.selectedImages.size;
}

/**
 * 检查是否全部选中
 * @returns {boolean}
 */
export function isAllSelected() {
    return state.selectedImages.size === state.allImages.length && state.allImages.length > 0;
}

/**
 * 获取已选择的图片列表
 * @returns {Array}
 */
export function getSelectedImages() {
    return Array.from(state.selectedImages)
        .sort((a, b) => a - b)
        .map(index => state.allImages[index]);
}
