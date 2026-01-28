/* ========================================
   应用入口 - app.js
   初始化应用和事件绑定
   ======================================== */

import { state } from './state.js';
import { scanImages } from './imageScanner.js';
import { displayImages, updateSelectedCount } from './ui.js';
import { toggleSelectAll, filterLargeImages, clearSelection } from './imageSelector.js';
import { downloadSelected } from './downloader.js';
import { initPreviewListeners } from './imagePreview.js';

/**
 * 初始化应用
 */
async function init() {
    try {
        // 扫描页面图片
        state.allImages = await scanImages();

        // 显示图片网格
        displayImages(state.allImages);

        // 初始化事件监听
        initEventListeners();
        initPreviewListeners();

    } catch (error) {
        console.error('初始化失败:', error);
        document.getElementById('gallery').innerHTML =
            '<div class="loading">扫描图片失败，请刷新页面重试</div>';
    }
}

/**
 * 绑定控制按钮事件
 */
function initEventListeners() {
    // 全选/取消全选
    document.getElementById('selectAll').addEventListener('click', toggleSelectAll);

    // 下载选中
    document.getElementById('download').addEventListener('click', downloadSelected);

    // 筛选大图
    document.getElementById('filterSize').addEventListener('click', () => filterLargeImages(500));

    // 清除选择
    document.getElementById('clearSelection').addEventListener('click', clearSelection);
}

// 启动应用
init();
