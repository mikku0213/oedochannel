document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("data/threads.json");
        const threads = await res.json();

        threads.forEach(thread => {
            const { id, title, tag, date, category, commentCount = 0 } = thread;

            const commentKey = `comments_${id}`;
            const localComments = localStorage.getItem(commentKey);
            const localCount = localComments ? JSON.parse(localComments).length : 0;

            const totalCount = commentCount + localCount; // ✅ JSON + localStorage

            const li = document.createElement("li");
            li.className = "thread-item";
            li.innerHTML = `
                <a href="thread.html?id=${id}">${title}</a>
                <div class="meta">
                <span class="tag">${tag}</span>
                <span class="comment-count">댓글 ${totalCount}</span>
                <span>${date}</span>
                </div>
            `;

            const listMap = {
                hot: "hot-list",
                info: "info-list",
                local: "local-list",
                secret: "secret-list"
            };

            const targetList = document.getElementById(listMap[category]);
            if (targetList) targetList.appendChild(li);
        });
    } catch (err) {
        console.error("스레드 목록 불러오기 실패", err);
    }

    document.getElementById("reset-button").addEventListener("click", () => {
        if (!confirm("정말로 모든 댓글을 초기화할까요?")) return;

        // 댓글 관련 localStorage 키만 삭제
        for (let key in localStorage) {
            if (key.startsWith("comments_")) {
                localStorage.removeItem(key);
            }
        }

        alert("댓글이 모두 초기화되었습니다!");
        location.reload(); // 새로고침으로 댓글 수 업데이트
    });



});
