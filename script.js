// 漢堡選單：點擊時切換「展開 / 收起」
const mobWrapper = document.querySelector(".mob-wrapper");
const hamburgerBtn = document.querySelector(".hamburger-btn");

hamburgerBtn.addEventListener("click", () => {
    const isOpen = mobWrapper.classList.toggle("open");
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
    hamburgerBtn.setAttribute("aria-label", isOpen ? "關閉選單" : "開啟選單");
});

// 首頁（這些效果只有 index.html 有對應的元素，一定要先檢查存在，不然在其他頁面會整段中斷）
if (document.querySelector(".definition-item")) {
    // 迷惘的定義
    document.querySelectorAll(".definition-item").forEach((item) => {
        item.addEventListener("mouseenter", () => {
            item.classList.add("revealed");
        });
    });

    // 迷惘共同經歷
    const lostSame = document.querySelector(".lost-same");
    if (lostSame) {
        lostSame.addEventListener("mouseenter", () => {
            lostSame.classList.add("revealed");
        });
    }

    // 四個面向（gsap 也只有首頁有載入，一併檢查）
    if (typeof gsap !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        const aspectsImg = document.querySelector(".aspects-img");
        if (aspectsImg) {
            ScrollTrigger.create({
                trigger: ".aspects-img",
                start: "top 80%",
                onEnter: () => {
                    aspectsImg.classList.add("revealed");
                },
            });
        }
    }
}

// 開門動畫：門開到哪裡跟著捲動位置走，往下捲慢慢打開，往上捲關回去
const doorScene = document.querySelector(".door-scene");
if (doorScene) {
    const doorAnim = doorScene.querySelector(".door-anim");
    const DOOR_FRAMES = 25; // 總共 25 格畫面
    const DOOR_COLS = 5;    // 大圖上一排 5 格
    const DOOR_ROWS = 5;    // 總共 5 排
    let currentFrame = -1;  // 目前顯示的是第幾格，一樣的話就不用重設

    function updateDoor() {
        const rect = doorScene.getBoundingClientRect();
        const center = rect.top + rect.height / 2; // 場景中心點離螢幕上緣多遠

        // 場景中心在螢幕 80% 高度時開始開門，捲到 40% 高度時完全打開
        const startLine = window.innerHeight * 0.8;
        const endLine = window.innerHeight * 0.4;

        // 換算成 0（關著）到 1（全開）之間的進度，超出範圍就固定在 0 或 1
        let progress = (startLine - center) / (startLine - endLine);
        progress = Math.min(1, Math.max(0, progress));

        const frame = Math.round(progress * (DOOR_FRAMES - 1));
        if (frame === currentFrame) return;
        currentFrame = frame;

        // 把「第幾格」換算成它在 5 × 5 大圖上的位置
        const x = (frame % DOOR_COLS) / (DOOR_COLS - 1) * 100;
        const y = Math.floor(frame / DOOR_COLS) / (DOOR_ROWS - 1) * 100;
        doorAnim.style.backgroundPosition = `${x}% ${y}%`;
    }

    window.addEventListener("scroll", updateDoor, { passive: true }); // 每次捲動都更新
    window.addEventListener("resize", updateDoor);                    // 視窗大小改變時也更新
    updateDoor();                                                     // 頁面載入時先算一次
}

// 首頁導覽列：捲到哪個段落，對應的按鈕就變色
const aboutLostSection = document.getElementById("about-lost");
const reservationSection = document.getElementById("reservation-section");

// 只有首頁有這兩個段落，其他頁面會直接跳過這整段
if (aboutLostSection && reservationSection) {
    const homeBtn = document.querySelector(".nav-button.home");
    const aboutLostBtn = document.querySelector(".nav-button.about-lost");
    const reservationBtn = document.querySelector(".nav-button.reservation");

    function updateActiveNav() {
        // 判斷線：螢幕由上往下 40% 的位置，段落的頂端超過這條線就算「進入」
        const line = window.innerHeight * 0.4;

        // 預設在首頁；越後面的段落越晚判斷，所以會蓋掉前面的結果
        let current = homeBtn;
        if (aboutLostSection.getBoundingClientRect().top <= line) current = aboutLostBtn;
        if (reservationSection.getBoundingClientRect().top <= line) current = reservationBtn;

        // 只有目前所在段落的按鈕加上 active，其他都拿掉
        [homeBtn, aboutLostBtn, reservationBtn].forEach((btn) => {
            btn.classList.toggle("active", btn === current);
        });
    }

    window.addEventListener("scroll", updateActiveNav, { passive: true }); // 每次捲動都檢查一次
    updateActiveNav(); // 頁面剛載入時先檢查一次（例如從別頁點「入住資訊」直接跳過來）
    window.addEventListener("load", updateActiveNav);       // 圖片都載入完、位置確定後再檢查一次
    window.addEventListener("hashchange", updateActiveNav); // 網址後面的 #段落 改變時也檢查一次
}

// 預約入住表單
// 入住資訊表單：可預約時段的多選下拉（按鈕打開／關閉面板，勾選後更新按鈕文字）
document.querySelectorAll(".multi-select").forEach((wrapper) => {
    const toggle = wrapper.querySelector(".multi-select-toggle");
    const panel = wrapper.querySelector(".multi-select-panel");
    const checkboxes = wrapper.querySelectorAll('input[type="checkbox"]');

    function updateToggleText() {
        const checkedCount = wrapper.querySelectorAll('input[type="checkbox"]:checked').length;
        toggle.textContent = checkedCount === 0 ? "請選擇時段" : `已選 ${checkedCount} 個時段`;
    }

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = !panel.hidden;

        // 先把「其他天」的選單全部收起來，確保一次只會開一個
        document.querySelectorAll(".multi-select").forEach((other) => {
            if (other !== wrapper) {
                other.querySelector(".multi-select-panel").hidden = true;
                other.querySelector(".multi-select-toggle").setAttribute("aria-expanded", "false");
            }
        });

        // 再切換自己的開關
        panel.hidden = isOpen;
        toggle.setAttribute("aria-expanded", !isOpen);
    });

        // 勾選或取消時段時，更新按鈕上的文字
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", updateToggleText);
        });
});

document.addEventListener("click", (e) => {
    document.querySelectorAll(".multi-select-panel").forEach((panel) => {
        if (!panel.hidden && !panel.closest(".multi-select").contains(e.target)) {
            panel.hidden = true;
            panel.closest(".multi-select").querySelector(".multi-select-toggle").setAttribute("aria-expanded", "false");
        }
    });
});

  // 租客資訊（手機版）：點姓名分頁籤切換要顯示的那張卡片
  const renterTabs = document.querySelectorAll(".renter-tab");
  if (renterTabs.length) {
      const renterCards = document.querySelectorAll(".renter-card");
      renterTabs.forEach((tab) => {
          tab.addEventListener("click", () => {
              renterTabs.forEach((t) => t.classList.remove("active"));
              renterCards.forEach((c) => c.classList.remove("active"));
              tab.classList.add("active");
              document.querySelector(".renter-card." + tab.dataset.target).classList.add("active");
          });
      });
   }

// 入住資訊表單：預約人數選「2位」才顯示同行者欄位；是否為贊助者選「是」才顯示贊助編號欄位
const reservationForm = document.getElementById("reservation-form");
if (reservationForm) {
    const guestRadios = reservationForm.querySelectorAll('input[name="guest-count"]');
    const companionFields = reservationForm.querySelectorAll(".companion-field");

    guestRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const isTwoGuests = reservationForm.querySelector('input[name="guest-count"]:checked').value === "2";
            companionFields.forEach((field) => {
                field.hidden = !isTwoGuests;
            });
        });
    });

    const sponsorRadios = reservationForm.querySelectorAll('input[name="is-sponsor"]');
    const sponsorField = reservationForm.querySelector(".sponsor-field");
    const donateHint = reservationForm.querySelector(".donate-hint"); // 「，我要募資」整段提示

    sponsorRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const isSponsor = reservationForm.querySelector('input[name="is-sponsor"]:checked').value === "yes";
            sponsorField.hidden = !isSponsor;
            donateHint.hidden = isSponsor; // 選「否」才顯示募資提示
        });
    });

    reservationForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(reservationForm);

        const templateParams = {
            name: formData.get("name"),
            email: formData.get("email"),
            guest_count: formData.get("guest-count"),
            companion_name: formData.get("companion-name") || "無",
            companion_email: formData.get("companion-email") || "無",
            is_sponsor: formData.get("is-sponsor") === "yes" ? "是" : "否",
            sponsor_id: formData.get("sponsor-id") || "無",
            time_1114: formData.getAll("time-1114").join("、") || "未選擇",
            time_1115: formData.getAll("time-1115").join("、") || "未選擇",
            note: formData.get("note") || "無",
        };

        try {
            await emailjs.send("service_5mhhtag", "template_xhj851j", templateParams);

            reservationForm.hidden = true;
            document.querySelector(".form-success").hidden = false;
        } catch (err) {
            console.error(err);
            alert("送出失敗，請稍後再試一次。");
        }
    });

    reservationForm.addEventListener("reset", () => {
        setTimeout(() => {
            document.querySelectorAll(".multi-select-toggle").forEach((toggle) => {
                toggle.textContent = "請選擇時段";
            });
            sponsorField.hidden = true; // 清除時把贊助編號欄位收起來
            donateHint.hidden = true;   // 清除時把募資提示收起來
        }, 0);
    });
}

// FAQ
// 常見問題手風琴：同時只能開一題，用 JS 量出實際高度給 max-height
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const btn = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  btn.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    faqItems.forEach((other) => {
      other.classList.remove("open");
      other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      other.querySelector(".faq-answer").style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// 聯絡我們表單
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const templateParams = {
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            message: formData.get("message"),
        };

        try {
            await emailjs.send("service_5mhhtag", "template_922yhka", templateParams);

            contactForm.hidden = true;
            document.querySelector(".form-success").hidden = false;
        } catch (err) {
            alert("送出失敗，請稍後再試一次。");
        }
    });
}