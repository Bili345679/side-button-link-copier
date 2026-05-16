// ==UserScript==
// @name         批量复制相似路径链接
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  鼠标侧键（后退键）悬停在<a>上时，批量复制所有相似结构<a>的href，并拦截后退事件
// @author       You
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 获取通用路径（不含 id、不含 :nth-child）
    function getGenericPath(element) {
        const path = [];
        let current = element;

        while (current && current !== document.body && current !== document.documentElement) {
            let tag = current.tagName.toLowerCase();
            if (current.classList && current.classList.length) {
                tag += '.' + Array.from(current.classList).join('.');
            }
            // 忽略 id 和 nth-child
            path.unshift(tag);
            current = current.parentNode;
        }
        return path.join(' ');
    }

    // 批量复制相似路径 a 标签的 href
    function batchCopySimilarLinks(aElement) {
        const genericPath = getGenericPath(aElement);
        // 根据通用路径找到所有相似 <a> 标签
        const similarLinks = document.querySelectorAll(genericPath);
        if (!similarLinks.length) {
            GM_notification({
                text: '未找到任何相似结构的链接',
                timeout: 2000
            });
            return;
        }

        // 提取所有 href
        const hrefs = Array.from(similarLinks)
            .map(link => link.href)
            .filter(href => href && href.trim() !== '');   // 过滤空值

        if (!hrefs.length) {
            GM_notification({
                text: '相似结构中无有效链接',
                timeout: 2000
            });
            return;
        }

        // 复制到剪贴板（每行一个链接）
        const clipboardText = hrefs.join('\n');
        GM_setClipboard(clipboardText, 'text');

        // 提示成功
        GM_notification({
            title: '批量复制成功',
            text: `已复制 ${hrefs.length} 个链接到剪贴板`,
            timeout: 3000
        });

        // 可选：短暂高亮所有匹配的链接（便于视觉反馈）
        similarLinks.forEach(link => {
            const originalOutline = link.style.outline;
            link.style.outline = '2px solid red';
            setTimeout(() => {
                link.style.outline = originalOutline;
            }, 500);
        });
    }

    // 鼠标按下事件（拦截侧键后退）
    document.addEventListener('mousedown', (e) => {
        // 检测侧键后退键（通常 button === 3）
        const isBackButton = (e.button === 3);
        if (!isBackButton) return;

        // 检查鼠标下方是否有 <a> 标签（或其子元素）
        const aTag = e.target.closest('a');
        if (!aTag) {
            // 没有悬停在 a 标签上，不拦截后退事件
            return;
        }

        // 拦截后退默认行为（防止浏览器后退）
        e.preventDefault();
        e.stopPropagation();   // 可选，阻止冒泡

        // 执行批量复制相似链接
        batchCopySimilarLinks(aTag);
    });
})();