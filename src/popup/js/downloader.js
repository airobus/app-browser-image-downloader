/* ========================================
   下载模块 - downloader.js
   负责图片下载功能
   ======================================== */

import { state, getSelectedCount } from './state.js';
import { sleep, getExtensionFromUrl } from './utils.js';
import { showStatus, hideStatus } from './ui.js';

/**
 * 下载选中的图片
 */
export async function downloadSelected() {
    const selectedCount = getSelectedCount();

    if (selectedCount === 0) {
        showStatus('请先选择要下载的图片', 'warning');
        return;
    }

    showStatus(`开始下载 ${selectedCount} 张图片...`, 'info');

    const selectedArray = Array.from(state.selectedImages).sort((a, b) => a - b);
    let successCount = 0;

    for (const index of selectedArray) {
        const img = state.allImages[index];
        const ext = getExtensionFromUrl(img.url);
        const filename = `image_${index + 1}_${Date.now()}${ext}`;

        try {
            await chrome.runtime.sendMessage({
                action: 'download',
                url: img.url,
                filename: filename
            });
            successCount++;
            showStatus(`正在下载 ${successCount}/${selectedCount}...`, 'info');
            await sleep(300);
        } catch (error) {
            console.error('下载失败:', img.url, error);
        }
    }

    showStatus(`成功下载 ${successCount} 张图片!`, 'success');
    setTimeout(() => hideStatus(), 3000);
}
