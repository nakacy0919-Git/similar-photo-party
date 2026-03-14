// === パスワード設定 ===
const CORRECT_PASSWORD = "party9"; // ここに好きなパスワードを設定してください

// 画面が開いた瞬間にパスワード入力を求める
const userInput = prompt("パスワードを入力してください:");

// パスワードが間違っている、またはキャンセルを押した場合
if (userInput !== CORRECT_PASSWORD) {
    alert("パスワードが違います。アクセスできません。");
    // 【修正箇所】間違えたら強制的に真っ白なページ（about:blank）に飛ばして追い出す！
    window.location.href = "about:blank";
}