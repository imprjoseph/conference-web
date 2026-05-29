/* =========================================================
   imPR Conference Website Frontend UX Upgrade
   上傳位置：網站根目錄 /assets/impr-homepage-upgrade.js
   功能：Banner loading、友善錯誤訊息、首頁區塊英文小標
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initHeroBannerLoading();
    softenFrontendErrorMessage();
    enhanceHomepageLabels();
});

/**
 * 01. Banner 圖片載入處理
 */
function initHeroBannerLoading() {
    const heroBanner = document.querySelector(".hero-banner");
    if (!heroBanner) return;

    const img = heroBanner.querySelector("img");

    if (!img) {
        heroBanner.classList.add("has-image-loaded");
        return;
    }

    function markLoaded() {
        heroBanner.classList.add("has-image-loaded");
    }

    if (img.complete && img.naturalWidth > 0) {
        markLoaded();
        return;
    }

    img.addEventListener("load", markLoaded);

    img.addEventListener("error", function () {
        heroBanner.classList.add("has-image-loaded");
        heroBanner.classList.add("image-load-error");
    });

    // 超過 4 秒仍未載入，保留 loading，不顯示錯誤
    window.setTimeout(function () {
        if (!img.complete) {
            heroBanner.setAttribute("data-loading-slow", "true");
        }
    }, 4000);
}

/**
 * 02. 前台錯誤訊息友善化
 */
function softenFrontendErrorMessage() {
    const possibleErrorBlocks = Array.from(document.querySelectorAll("section, div, article"))
        .filter(function (el) {
            const text = (el.textContent || "").trim();
            return text.includes("無法連線至伺服器") ||
                   text.includes("GAS 沒有重新部署") ||
                   text.includes("目前 API URL");
        });

    if (!possibleErrorBlocks.length) return;

    possibleErrorBlocks.forEach(function (block) {
        if (document.body.classList.contains("dev-mode")) return;

        block.innerHTML = `
            <div class="frontend-friendly-error">
                <div class="frontend-friendly-error-icon">ℹ</div>
                <div>
                    <h3>資料載入時間較長</h3>
                    <p>目前活動資料與圖片仍在載入中，請稍候片刻。若畫面長時間未更新，請重新整理頁面。</p>
                    <button type="button" class="btn btn-primary" onclick="window.location.reload()">重新整理</button>
                </div>
            </div>
        `;

        block.style.display = "none";

        // 延後 8 秒才顯示，避免圖片或 GAS 還在載入就被誤判為錯誤
        window.setTimeout(function () {
            block.style.display = "block";
        }, 8000);
    });
}

/**
 * 03. 區塊標題微調
 */
function enhanceHomepageLabels() {
    const sectionMap = [
        { keyword: "最新消息", eyebrow: "NEWS", desc: "掌握活動最新公告與重要提醒" },
        { keyword: "會議介紹", eyebrow: "ABOUT", desc: "了解本次活動目標、議題方向與參與價值" },
        { keyword: "講師介紹", eyebrow: "SPEAKERS", desc: "邀集專業講者分享產業觀點與實務經驗" },
        { keyword: "會議議程", eyebrow: "AGENDA", desc: "查看完整時程安排與各場次重點" },
        { keyword: "線上報名", eyebrow: "REGISTRATION", desc: "填寫報名資料，完成活動參與登記" },
        { keyword: "交通資訊", eyebrow: "VENUE", desc: "活動地點、交通方式與現場資訊" },
        { keyword: "下載專區", eyebrow: "DOWNLOAD", desc: "下載會議簡章、講義與相關文件" },
        { keyword: "常見問題", eyebrow: "FAQ", desc: "快速查詢活動報名與參與相關問題" }
    ];

    sectionMap.forEach(function (item) {
        const h2List = Array.from(document.querySelectorAll(".section-title h2, section h2"));

        h2List.forEach(function (h2) {
            if (!h2.textContent.trim().includes(item.keyword)) return;

            const titleWrap = h2.closest(".section-title");
            if (!titleWrap) return;

            if (!titleWrap.querySelector(".section-eyebrow")) {
                const eyebrow = document.createElement("div");
                eyebrow.className = "section-eyebrow";
                eyebrow.textContent = item.eyebrow;
                titleWrap.insertBefore(eyebrow, h2);
            }

            const p = titleWrap.querySelector("p");
            if (p && (!p.textContent || p.textContent.trim().length < 18)) {
                p.textContent = item.desc;
            }
        });
    });
}
