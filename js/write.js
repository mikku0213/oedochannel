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
    const nickname = nicknameInput.value.trim() || "익명";
    const tag = document.getElementById("post-tag").value.trim();
    const content = document.getElementById("post-content").value.trim();

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

