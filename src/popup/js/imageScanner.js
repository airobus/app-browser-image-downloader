/* ========================================
   图片扫描模块 - imageScanner.js
   负责扫描页面图片
   ======================================== */

/**
 * 扫描当前页面的所有图片
 * @returns {Promise<Array>} 图片列表
 */
export async function scanImages() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractImages
    });

    return results[0].result;
}

/**
 * 在页面上下文中提取图片信息
 * 注意：此函数在页面中执行，不能访问模块作用域
 */
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

/**
 * 获取图片文件大小
 * @param {string} url - 图片 URL
 * @returns {Promise<number|null>} 文件大小（字节）
 */
export async function fetchImageSize(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('Content-Length');
        return contentLength ? parseInt(contentLength) : null;
    } catch (error) {
        return null;
    }
}
