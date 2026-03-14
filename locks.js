// === パスワード設定 ===
const CORRECT_PASSWORD = "party9"; // ここに好きなパスワードを設定してください

// 画面が開いた瞬間にパスワード入力を求める
const userInput = prompt("パスワードを入力してください:");

// パスワードが間違っている、またはキャンセルを押した場合
if (userInput !== CORRECT_PASSWORD) {
    alert("パスワードが違います。アクセスできません。");
    // 画面の中身を真っ白にして、エラーメッセージだけにする
    document.body.innerHTML = "<h1 style='text-align:center; margin-top:20vh; font-family:sans-serif;'>アクセス制限されています🔒</h1>";
}