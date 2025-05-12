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

    let data = null;

    // ✅ 1차 시도: fetch로 JSON 게시글 불러오기
    try {
        const res = await fetch(`data/thread_${threadId}.json`);
        data = await res.json();
    } catch (err) {
        // ✅ 2차 시도: localStorage에서 사용자 게시글 찾기
        const local = localStorage.getItem(`thread_${threadId}`);
        if (local) {
            data = JSON.parse(local);
        }
    }
    if (data) {
        isAnonymousBoard = (data.category === "secret");

        if (isAnonymousBoard) {
            const nicknameInput = document.getElementById("nickname");
            if (nicknameInput) {
                nicknameInput.value = "익명";
                nicknameInput.disabled = true;
            }
        }
        // ✅ 게시글이 존재하지 않으면 안내
    } else {
        postTitleEl.textContent = "존재하지 않는 게시글입니다.";
        contentEl.innerHTML = "<p>해당 글을 찾을 수 없습니다.</p>";
        return;
    }

    // ✅ 게시글 정보 표시
    initialComments = data.comments || [];
    isAnonymousBoard = (data.category === "secret");

    postTitleEl.textContent = data.title;
    metaEl.innerHTML = `<span class="tag">${data.tag}</span> ${data.date} by ${data.nickname ?? "익명"}`;
    contentEl.innerHTML = `<p>${data.content}</p>`;

    loadComments();


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
        const text = document.getElementById("newComment").value.trim();
        const nicknameInput = document.getElementById("nickname");
        const nickname = isAnonymousBoard ? "익명" : nicknameInput?.value.trim();

        if (!text || (!isAnonymousBoard && !nickname)) {
            alert("닉네임과 댓글 내용을 모두 입력해 주세요.");
            return;
        }

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
