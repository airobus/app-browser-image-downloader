/* ========================================
   工具函数模块 - utils.js
   通用工具函数
   ======================================== */

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
    if (!bytes) return '未知';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 延时函数
 * @param {number} ms - 毫秒数
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 从 URL 中提取文件扩展名
 * @param {string} url - 图片 URL
 * @returns {string} 扩展名（如 .jpg）
 */
export function getExtensionFromUrl(url) {
    try {
        const urlPath = new URL(url).pathname;
        const match = urlPath.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
        if (match) {
            return match[0].toLowerCase();
        }
    } catch (e) {
        console.log('无法解析URL:', url);
    }
    return '.jpg'; // 默认扩展名
}
