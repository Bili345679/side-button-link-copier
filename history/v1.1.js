// ==UserScript==
// @name         批量复制相似路径链接（修正版）
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  鼠标侧键（后退键）悬停在<a>上时，批量复制所有相似结构<a>的href，并完全阻止后退事件
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
            path.unshift(tag);
            current = current.parentNode;
        }
        return path.join(' ');
    }

    // 批量复制相似路径 a 标签的 href
    function batchCopySimilarLinks(aElement) {
        const genericPath = getGenericPath(aElement);
        const similarLinks = document.querySelectorAll(genericPath);
        if (!similarLinks.length) {
            GM_notification({ text: '未找到任何相似结构的链接', timeout: 2000 });
            return;
        }

        const hrefs = Array.from(similarLinks)
            .map(link => link.href)
            .filter(href => href && href.trim() !== '');

        if (!hrefs.length) {
            GM_notification({ text: '相似结构中无有效链接', timeout: 2000 });
            return;
        }

        const clipboardText = hrefs.join('\n');
        GM_setClipboard(clipboardText, 'text');

        GM_notification({
            title: '批量复制成功',
            text: `已复制 ${hrefs.length} 个链接到剪贴板`,
            timeout: 3000
        });

        // 短暂高亮所有匹配的链接
        similarLinks.forEach(link => {
            const originalOutline = link.style.outline;
            link.style.outline = '2px solid red';
            setTimeout(() => {
                link.style.outline = originalOutline;
            }, 500);
        });
    }

    // 辅助函数：检查目标是否在 <a> 内部
    function getParentA(target) {
        return target.closest('a');
    }

    // 拦截 mousedown（提前防止某些浏览器预加载后退内容）
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 3) return;          // 仅侧键后退键
        const aTag = getParentA(e.target);
        if (!aTag) return;                   // 不在 <a> 上，不拦截，正常后退
        e.preventDefault();
        e.stopPropagation();
    });

    // 主要处理逻辑放在 mouseup（此时才会真正触发导航）
    document.addEventListener('mouseup', (e) => {
        if (e.button !== 3) return;
        const aTag = getParentA(e.target);
        if (!aTag) return;                   // 不在 <a> 上，允许后退

        // 阻止后退默认行为
        e.preventDefault();
        e.stopPropagation();

        // 执行批量复制
        batchCopySimilarLinks(aTag);
    });
})();