document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(location.search);
    const threadId = params.get("id") || "001";

    const localKey = `comments_${threadId}`;
    const postTitleEl = document.getElementById("post-title");
    const metaEl = document.querySelector("#post .meta");
    const contentEl = document.querySelector(".post-content");
    const commentsList = document.getElementById("comments");
    const textarea = document.getElementById("newComment");

    let initialComments = [];
    let isAnonymousBoard = false;

    // 게시글 JSON 불러오기
    try {
        const res = await fetch(`data/thread_${threadId}.json?ts=${Date.now()}`);
        const data = await res.json();

        initialComments = data.comments || [];
        isAnonymousBoard = (data.category === "secret");

        postTitleEl.textContent = data.title;
        metaEl.innerHTML = `<span class="tag">${data.tag}</span> ${data.date}`;
        contentEl.innerHTML = `<p>${data.content}</p>`;

        // 익명 게시판이면 닉네임 입력창 숨기기
        if (isAnonymousBoard) {
            const nicknameInput = document.getElementById("nickname");
            if (nicknameInput) nicknameInput.style.display = "none";
        }

        loadComments();
    } catch (err) {
        postTitleEl.textContent = "존재하지 않는 게시글입니다.";
        contentEl.innerHTML = "<p>해당 글을 찾을 수 없습니다.</p>";
    }

    // 댓글 렌더링
    function renderComment(comment) {
        const nickname = comment.nickname ?? "익명";
        const text = comment.text ?? "(내용 없음)";
        const time = comment.time ?? "-";

        const li = document.createElement("li");
        li.className = "comment-item";
        const user = isAnonymousBoard ? "익명" : nickname;
        const displayTime = formatRelativeTime(time);

        li.innerHTML = `<strong>${user}</strong> <span class="date">${displayTime}</span><p>${text}</p>`;

        return li;
    }

    // 댓글 출력
    function loadComments() {
        const saved = localStorage.getItem(localKey);
        const savedComments = saved ? JSON.parse(saved) : [];

        const allComments = [...initialComments, ...savedComments];
        commentsList.innerHTML = "";

        allComments.forEach(comment => {
            const li = renderComment(comment);
            if (li) commentsList.appendChild(li);
        });
    }

    // 댓글 작성
    window.addComment = function () {
        const text = textarea.value.trim();
        const nickname = document.getElementById("nickname")?.value.trim();

        if (!text) return;

        const now = new Date();
        const time = now.toISOString(); // ← 기존 yyyy/mm/dd 대신


        const saved = localStorage.getItem(localKey);
        const comments = saved ? JSON.parse(saved) : [];

        comments.push({ text, time, nickname });
        localStorage.setItem(localKey, JSON.stringify(comments));

        textarea.value = "";
        if (!isAnonymousBoard && document.getElementById("nickname")) {
            document.getElementById("nickname").value = "";
        }

        loadComments();
    };
    function formatRelativeTime(isoDateStr) {
        try {
            const now = new Date();
            const input = new Date(isoDateStr);
            const diff = Math.floor((now - input) / 1000); // 초 단위

            if (diff < 60) return "방금 전";
            if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
            if (diff < 172800) return "어제";
            if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
            return input.toLocaleDateString("ko-KR");
        } catch {
            return isoDateStr;
        }
    }






});
