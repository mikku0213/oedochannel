// 헤더 불러오기
fetch('header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;
    });

// 게시글 작성 처리
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("post-form");
    const categorySelect = document.getElementById("post-category");
    const nicknameInput = document.getElementById("nickname");

    // 게시판 선택 시 닉네임 입력 비활성화 처리
    categorySelect.addEventListener("change", () => {
        if (categorySelect.value === "secret") {
            nicknameInput.value = "익명";
            nicknameInput.disabled = true;
        } else {
            nicknameInput.disabled = false;
            nicknameInput.value = "";
        }
    });

    // 글 작성 처리
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const title = document.getElementById("input-title").value.trim();
        const category = categorySelect.value;
        const isAnonymous = category === "secret";

        // 닉네임은 익명 게시판이면 강제 "익명"
        const nickname = isAnonymous ? "익명" : (nicknameInput.value.trim() || "익명");
        const rawTag = document.getElementById("post-tag").value.trim();
        const tag = rawTag || "기타"; // 선택 항목 → 기본값 "기타"
        const content = document.getElementById("post-content").value.trim();

        if (!title || !category || !content || (!isAnonymous && !nicknameInput.value.trim())) {
            alert("제목, 게시판, 내용, (익명 게시판이 아닐 경우 닉네임)을 입력해 주세요.");
            return;
        }

        const now = new Date();
        const date = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
        const id = `user_${Date.now()}`;

        const post = { id, title, tag, date, category, commentCount: 0 };
        const detail = { id, title, tag, date, category, nickname, content, comments: [] };

        const userThreads = JSON.parse(localStorage.getItem("userThreads") || "[]");
        userThreads.unshift(post);
        localStorage.setItem("userThreads", JSON.stringify(userThreads));
        localStorage.setItem(`thread_${id}`, JSON.stringify(detail));

        alert("게시글이 작성되었습니다!");
        window.location.href = `thread.html?id=${id}`;
    });

});

