// ==UserScript==
// @name         侧键链接复制器
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  鼠标侧键：后退键批量复制所有相似结构链接，前进键批量复制相同位置链接
// @author       Bili345679
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    /**
     * 获取通用路径
     * @param {Element} element - 目标元素
     * @param {boolean} distinguishPosition - 是否区分位置（为 true 时，在最近的有多个兄弟的分支上添加 :nth-child）
     * @returns {string} CSS 选择器路径
     */
    function getGenericPath(element, distinguishPosition = false) {
        const path = [];
        let current = element;
        let branchAdded = false;  // 是否已经为最近的一个多元素分支添加了 :nth-child

        while (current && current !== document.body && current !== document.documentElement) {
            let tag = current.tagName.toLowerCase();

            // 添加 class（与原来一致）
            if (current.classList && current.classList.length) {
                tag += '.' + Array.from(current.classList).join('.');
            }

            // 如果需要区分位置，并且还没有为任何层级添加 :nth-child
            if (distinguishPosition && !branchAdded) {
                const parent = current.parentNode;
                if (parent && parent.nodeType === Node.ELEMENT_NODE) {
                    // 获取父元素下所有相同标签名的子元素（不包含更深层，只考虑直接子元素）
                    const siblings = Array.from(parent.children).filter(
                        child => child.tagName === current.tagName
                    );
                    if (siblings.length > 1) {
                        // 计算当前元素在同标签兄弟中的索引（从 1 开始）
                        const index = siblings.indexOf(current) + 1;
                        tag += `:nth-child(${index})`;
                        branchAdded = true;   // 只添加最近的一个分支
                    }
                }
            }

            path.unshift(tag);
            current = current.parentNode;
        }

        return path.join(' ');
    }

    /**
     * 批量复制相似路径 <a> 的 href
     * @param {HTMLAnchorElement} aElement - 当前悬停的 <a>
     * @param {boolean} distinguishPosition - 是否区分位置
     */
    function batchCopySimilarLinks(aElement, distinguishPosition) {
        const genericPath = getGenericPath(aElement, distinguishPosition);
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
            title: distinguishPosition ? '批量复制（相同位置）成功' : '批量复制（全部相似）成功',
            text: `已复制 ${hrefs.length} 个链接到剪贴板`,
            timeout: 3000
        });

        // 短暂高亮
        similarLinks.forEach(link => {
            const originalOutline = link.style.outline;
            link.style.outline = '2px solid red';
            setTimeout(() => {
                link.style.outline = originalOutline;
            }, 500);
        });
    }

    // 辅助：获取最近的 <a>
    function getParentA(target) {
        return target.closest('a');
    }

    // 拦截 mousedown（提前防止预加载）
    document.addEventListener('mousedown', (e) => {
        const isBack = (e.button === 3);
        const isForward = (e.button === 4);
        if (!isBack && !isForward) return;

        const aTag = getParentA(e.target);
        if (!aTag) return;   // 不在 <a> 上，不拦截

        e.preventDefault();
        e.stopPropagation();
    });

    // mouseup 执行实际复制逻辑
    document.addEventListener('mouseup', (e) => {
        const isBack = (e.button === 3);
        const isForward = (e.button === 4);
        if (!isBack && !isForward) return;

        const aTag = getParentA(e.target);
        if (!aTag) return;

        e.preventDefault();
        e.stopPropagation();

        if (isBack) {
            // 后退键：不区分位置，选取所有相似结构 <a>
            batchCopySimilarLinks(aTag, false);
        } else if (isForward) {
            // 前进键：区分位置，选取相同位置的 <a>
            batchCopySimilarLinks(aTag, true);
        }
    });
})();
