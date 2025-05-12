document.addEventListener("DOMContentLoaded", async () => {
  const threadListMap = {
    hot: document.getElementById("hot-list"),
    info: document.getElementById("info-list"),
    local: document.getElementById("local-list"),
    secret: document.getElementById("secret-list")
  };

  try {
    const res = await fetch("data/threads.json");
    const serverThreads = await res.json();
    const userThreads = JSON.parse(localStorage.getItem("userThreads") || "[]");

    // nickname 추가
    const enrichedUserThreads = await Promise.all(
      userThreads.map(async (t) => {
        const detail = localStorage.getItem(`thread_${t.id}`);
        if (detail) {
          const parsed = JSON.parse(detail);
          return { ...t, nickname: parsed.nickname ?? "익명" };
        }
        return t;
      })
    );

    const allThreads = [...enrichedUserThreads, ...serverThreads];

    // ✅ 카테고리별 3개씩 최신순으로 출력
    Object.entries(threadListMap).forEach(([category, ul]) => {
      const filtered = allThreads
        .filter(t => t.category === category)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

      filtered.forEach(thread => {
        const { id, title, tag, date, commentCount = 0, nickname } = thread;
        const commentKey = `comments_${id}`;
        const localComments = localStorage.getItem(commentKey);
        const localCount = localComments ? JSON.parse(localComments).length : 0;
        const totalCount = commentCount + localCount;

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

        ul.appendChild(li);
      });
    });

  } catch (err) {
    console.error("스레드 목록 불러오기 실패", err);
  }

  // 초기화 버튼
  document.getElementById("reset-button").addEventListener("click", () => {
    if (!confirm("정말로 모든 댓글과 작성한 게시글을 초기화할까요?")) return;

    for (let key in localStorage) {
      if (key.startsWith("comments_")) {
        localStorage.removeItem(key);
      }
    }

    const userThreads = JSON.parse(localStorage.getItem("userThreads") || "[]");
    userThreads.forEach(thread => {
      localStorage.removeItem(`thread_${thread.id}`);
    });
    localStorage.removeItem("userThreads");

    alert("모든 댓글과 게시글이 초기화되었습니다.");
    location.reload();
  });
});
