// ======================================================
// 1. HIỆU ỨNG MATRIX RAIN
// ======================================================
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*ETHOSMIRROR';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];
for (let i = 0; i < columns; i++) drops[i] = 1;

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f3ff';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 33);
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

// ======================================================
// 2. HỆ THỐNG ÂM THANH
// ======================================================
let audioCtx;
let isSoundOn = false;

function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function toggleSound() {
    const btn = document.getElementById('soundBtn');
    if (!isSoundOn) {
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        isSoundOn = true;
        btn.innerHTML = "🔊 SOUND: ON";
        btn.classList.add('sound-on');
        playPowerUp();
    } else {
        isSoundOn = false;
        btn.innerHTML = "🔇 SOUND: OFF";
        btn.classList.remove('sound-on');
    }
}
function playTone(freq, type, duration, vol = 0.1) {
    if (!isSoundOn || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}
function playTyping(vol = 0.1) { playTone(600 + Math.random() * 200, 'triangle', 0.05, vol); }
function playHover() { playTone(1200, 'sine', 0.05, 0.05); }
function playPowerUp() { playTone(440, 'sine', 0.2, 0.2); setTimeout(() => playTone(880, 'sine', 0.4, 0.2), 200); }
function playScan() { if (!isSoundOn || !audioCtx) return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sawtooth'; osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1.5); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 1.5); }
function playAlarm() { if (!isSoundOn || !audioCtx) return; let i = 0; let interval = setInterval(() => { playTone(300, 'square', 0.2, 0.2); setTimeout(() => playTone(600, 'square', 0.2, 0.2), 250); i++; if (i > 4) clearInterval(interval); }, 600); }
function playVictory() { if (!isSoundOn || !audioCtx) return; playTone(440, 'sine', 0.2, 0.2); setTimeout(() => playTone(554.37, 'sine', 0.2, 0.2), 200); setTimeout(() => playTone(659.25, 'sine', 0.2, 0.2), 400); setTimeout(() => playTone(880, 'sine', 0.6, 0.2), 600); }

// ======================================================
// 3. QUẢN LÝ TÀI KHOẢN (BẮT ĐẦU TỪ LEVEL 1)
// ======================================================
let currentUser = null;

function showRegister() { document.getElementById('loginForm').style.display = 'none'; document.getElementById('registerForm').style.display = 'block'; document.getElementById('authMsg').innerText = ""; }
function showLogin() { document.getElementById('loginForm').style.display = 'block'; document.getElementById('registerForm').style.display = 'none'; document.getElementById('authMsg').innerText = ""; }

function register() {
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value.trim();
    const msg = document.getElementById('authMsg');
    if (!u || !p) { msg.innerText = "Vui lòng nhập đầy đủ thông tin!"; return; }
    if (localStorage.getItem("user_" + u)) { msg.innerText = "Tên định danh đã tồn tại!"; return; }
    
    // KHỞI TẠO TẤT CẢ CHỈ SỐ LÀ 1%
    const userData = { password: p, stats: { logic: 1, bio: 1, disc: 1, psych: 1, create: 1 }, history: [] };
    localStorage.setItem("user_" + u, JSON.stringify(userData));
    alert("Khởi tạo thành công! Hãy kết nối bản thể."); showLogin();
}

function login() {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    const msg = document.getElementById('authMsg');
    
    const storedData = localStorage.getItem("user_" + u);
    if (!storedData) { msg.innerText = "Không tìm thấy dữ liệu!"; return; }
    
    const userData = JSON.parse(storedData);
    if (userData.password === p) {
        currentUser = u;
        loadUserData(u);
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('welcomeUser').innerText = "HI, " + u.toUpperCase();
        try { playPowerUp(); } catch(e){}
    } else { msg.innerText = "Mã bảo mật không đúng!"; }
}

function logout() { location.reload(); }

function loadUserData(username) {
    const userData = JSON.parse(localStorage.getItem("user_" + username));
    if (userData) updateUI(userData.stats);
}

function saveUserData(newStats) {
    if (!currentUser) return;
    const storedData = JSON.parse(localStorage.getItem("user_" + currentUser));
    if (storedData) {
        storedData.stats = newStats;
        localStorage.setItem("user_" + currentUser, JSON.stringify(storedData));
    }
}

// ======================================================
// 4. HỆ THỐNG XẾP HẠNG & ANTI-SPAM LEVEL 100
// ======================================================
let hasReachedMaxLevel = false;

function calculateRank(stats) {
    let total = stats.logic + stats.bio + stats.disc + stats.psych + stats.create;
    let avg = Math.floor(total / 5);
    
    let rankName = "", rankColor = "";

    if (avg < 20) { rankName = "THỰC TẬP SINH"; rankColor = "#888"; } 
    else if (avg < 50) { rankName = "KẺ THỨC TỈNH"; rankColor = "#0aff00"; } 
    else if (avg < 80) { rankName = "CHIẾN BINH SỐ"; rankColor = "#00f3ff"; } 
    else if (avg < 99) { rankName = "ĐẤNG KIẾN TẠO"; rankColor = "#bc00ff"; } 
    else { rankName = "⚡ THE SINGULARITY ⚡"; rankColor = "#ffe600"; }

    const rankEl = document.getElementById('userRank');
    if (rankEl) {
        rankEl.innerText = `LV.${avg} | ${rankName}`;
        rankEl.style.color = rankColor;
        rankEl.style.borderColor = rankColor;
        rankEl.style.textShadow = `0 0 10px ${rankColor}`;
    }

    if (avg === 100) {
        if (!hasReachedMaxLevel) {
            hasReachedMaxLevel = true;
            setTimeout(() => {
                document.getElementById('victoryPopup').style.display = 'flex';
                playVictory(); 
            }, 1500); 
        }
    } else {
        hasReachedMaxLevel = false; 
    }
}

function closeVictory() { document.getElementById('victoryPopup').style.display = 'none'; }

// ======================================================
// 5. BIỂU ĐỒ RADAR (CHART)
// ======================================================
let myRadarChart;
function initChart(stats) {
    const canvas = document.getElementById('skillsChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myRadarChart) myRadarChart.destroy();
    
    myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Tâm Lý', 'Sáng Tạo', 'Thể Chất', 'Kỷ Luật', 'Trí Tuệ'],
            datasets: [{
                label: 'Chỉ Số',
                data: [stats.psych, stats.create, stats.bio, stats.disc, stats.logic],
                backgroundColor: 'rgba(0, 243, 255, 0.25)',
                borderColor: '#00f3ff',
                pointBackgroundColor: '#bc00ff',
                pointBorderColor: '#fff',
                pointRadius: 4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { 
                r: { 
                    angleLines: { color: 'rgba(255,255,255,0.1)' }, 
                    grid: { color: 'rgba(255,255,255,0.1)' }, 
                    pointLabels: { color: '#bc00ff', font: { size: 13, family: 'Orbitron' } }, 
                    ticks: { display: false, min: 0, max: 100 } 
                } 
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ======================================================
// 6. BỘ NÃO TRUNG TÂM (CORE ENGINE - MICRO HABITS)
// ======================================================
function runEngine() {
    const inputRaw = document.getElementById('userInput').value;
    const input = inputRaw.toLowerCase();
    const output = document.getElementById('consoleOutput');
    const btn = document.querySelector('.btn-activate');

    if (input.length < 5) { alert("Vui lòng chia sẻ thêm chi tiết..."); return; }

    playScan();
    btn.disabled = true; btn.innerText = "ĐANG ĐỒNG BỘ HÓA DỮ LIỆU...";
    output.innerHTML = "";
    
    let logs = ["> Trích xuất ngữ nghĩa...", "> Kết nối Neural Network...", "> Mã hóa thông tin...", "> <span style='color:#0aff00'>THÀNH CÔNG.</span>"];
    let delay = 0;
    logs.forEach(log => { setTimeout(() => { output.innerHTML += log + "<br>"; playTyping(0.2); }, delay); delay += 500; });

    setTimeout(() => {
        let currentStats = getCurrentStatsFromDOM();
        let context = detectContext(input);

        // CÂN BẰNG NHỊP ĐỘ (MICRO-HABITS)
        if (context === 'emotional_crisis') { currentStats.psych -= 3; currentStats.bio -= 1; }
        else if (context === 'burnout') { currentStats.psych += 1; currentStats.bio -= 3; }
        else if (context === 'lazy') { currentStats.disc -= 3; currentStats.logic -= 1; }
        else if (context === 'growth') { currentStats.logic += 3; currentStats.disc += 1; currentStats.psych += 1; }
        else if (context === 'creative_flow') { currentStats.create += 3; currentStats.psych += 1; }
        else if (context === 'workout') { currentStats.bio += 3; currentStats.disc += 1; currentStats.psych += 1; }

        for (let key in currentStats) currentStats[key] = Math.min(100, Math.max(0, currentStats[key]));

        updateUI(currentStats);
        saveUserData(currentStats);
        saveMemory(inputRaw, context); // Lưu Lõi Ký Ức
        generateTextReport(context, output);
        checkCriticalStats(currentStats);

        btn.disabled = false; btn.innerText = "⚡ KÍCH HOẠT MÔ PHỎNG";
        document.getElementById('userInput').value = ""; // Clear input after success
    }, 2500);
}

function updateUI(stats) {
    document.getElementById('val-logic').innerText = stats.logic;
    document.getElementById('val-bio').innerText = stats.bio;
    document.getElementById('val-disc').innerText = stats.disc;
    document.getElementById('val-psych').innerText = stats.psych;
    document.getElementById('val-create').innerText = stats.create;
    initChart(stats); checkBadges(stats); calculateRank(stats);
}

function getCurrentStatsFromDOM() {
    return {
        logic: parseInt(document.getElementById('val-logic').innerText),
        bio: parseInt(document.getElementById('val-bio').innerText),
        disc: parseInt(document.getElementById('val-disc').innerText),
        psych: parseInt(document.getElementById('val-psych').innerText),
        create: parseInt(document.getElementById('val-create').innerText)
    };
}

function detectContext(text) {
    if (text.match(/tập|gym|thể dục|thể thao|chạy bộ|đá bóng|workout|bơi/)) return 'workout';
    if (text.match(/cãi|ba mẹ|bố mẹ|gia đình|khóc|buồn|cô đơn|thất tình|chia tay|tổn thương|đau lòng/)) return 'emotional_crisis';
    if (text.match(/mệt|áp lực|chán|stress|đuối|kiệt sức/)) return 'burnout';
    if (text.match(/lười|game|chơi|ngủ nướng|trì hoãn|không muốn làm/)) return 'lazy';
    if (text.match(/vẽ|viết|ý tưởng|nhạc|sáng tạo|nghĩ|brainstorm/)) return 'creative_flow';
    if (text.match(/học|code|làm|xong|tốt|hoàn thành|đọc sách/)) return 'growth';
    return 'lazy'; 
}

// ======================================================
// 7. KIỂM TRA MỞ KHÓA 6 HUY HIỆU (BADGES)
// ======================================================
function checkBadges(stats) {
    document.querySelectorAll('.badge').forEach(b => b.classList.remove('unlocked'));

    if (stats.disc >= 80) document.getElementById('badge-disc').classList.add('unlocked');
    if (stats.create >= 80) document.getElementById('badge-create').classList.add('unlocked');
    if (stats.logic >= 80) document.getElementById('badge-logic').classList.add('unlocked');
    if (stats.psych >= 80) document.getElementById('badge-psych').classList.add('unlocked');
    if (stats.bio >= 80) document.getElementById('badge-bio').classList.add('unlocked');

    if (stats.psych >= 80 && stats.create >= 80 && stats.bio >= 80 && stats.disc >= 80 && stats.logic >= 80) {
        document.getElementById('badge-master').classList.add('unlocked');
    }
}

// ======================================================
// 8. TẠO BÁO CÁO TƯƠNG LAI
// ======================================================
function generateTextReport(context, display) {
    let timelineA = "", timelineB = "", msg = "", action = "";
    
    if (context === 'emotional_crisis') {
        timelineA = "⚠️ VÙNG TỐI TÂM LÝ: Việc chối bỏ hay kìm nén nỗi đau sẽ chỉ khiến vết thương âm thầm rỉ sét, giam cầm sự tự do của bản thể."; 
        timelineB = "🌟 TÁI SINH TỪ VẾT NỨT: Không có sự hoàn mỹ nào chưa từng trải qua thương tổn. Nỗi đau đang khoét sâu tâm hồn bạn, chỉ để tạo ra nhiều không gian hơn cho sự bình yên sau này.";
        msg = "📩 TỪ BẢN THỂ TƯƠNG LAI (2035): \"Nghe này, tôi đang ôm cậu từ tương lai đây. Đừng gồng mình gánh vác cả thế giới nữa. Cứ vỡ vụn đi nếu cậu muốn, tôi sẽ ở đây gom từng mảnh ghép lại cùng cậu.\""; 
        action = "🔥 ĐẶC QUYỀN BẢO HỘ: Tạm ngắt kết nối với thế giới. Tắt màn hình, cuộn tròn trong chăn ấm và cho phép mình yếu đuối trọn vẹn đêm nay. Hệ thống sẽ đứng gác cho cậu ngủ.";
    } 
    else if (context === 'burnout') {
        timelineA = "⚠️ CẢNH BÁO: Cố quá sẽ thành kiệt quệ. Đừng đánh đổi sức khỏe lấy thành tích ảo."; 
        timelineB = "🌟 CHIẾN LƯỢC: Nghỉ ngơi là bước lùi cần thiết để nạp lại năng lượng.";
        msg = "📩 TỪ 2035: \"Cảm ơn vì hôm nay cậu đã dám nghỉ ngơi để tôi có sức đi tiếp.\""; 
        action = "🔥 NHIỆM VỤ: Ngắt kết nối thiết bị. Hít thở sâu. Cho phép bản thân nghỉ ngơi. Thế giới cứ để mai lo!";
    }
    else if (context === 'lazy') {
        timelineA = "⚠️ HỐI TIẾC: Sự lười biếng hôm nay đang dần phá hủy bản thể hoàn mỹ của bạn."; 
        timelineB = "🌟 BỨT PHÁ: Kỷ luật mang lại tự do tuyệt đối.";
        msg = "📩 TỪ 2035: \"Đừng để tôi thất vọng. Cậu mạnh mẽ hơn sự trì hoãn này!\""; 
        action = "🔥 NHIỆM VỤ: Quy tắc 5 giây - Đếm ngược 5,4,3,2,1 và ĐỨNG DẬY NGAY LẬP TỨC!";
    } 
    else if (context === 'growth') {
        timelineA = "⚠️ CẠM BẪY: Một chiến thắng đơn lẻ không tạo nên huyền thoại. Việc dừng lại vào ngày mai sẽ xóa sạch nỗ lực của ngày hôm nay."; 
        timelineB = "🌟 TIẾN HÓA: Từng tế bào và tư duy của bạn đang được nâng cấp. Quá trình 'Kiến tạo' đang diễn ra vô cùng mạnh mẽ.";
        msg = "📩 TỪ 2035: \"Những giọt mồ hôi lặng lẽ của cậu ngày hôm nay, chính là thứ ánh sáng rực rỡ nhất của tôi ở tương lai. Cảm ơn vì đã không bỏ cuộc.\""; 
        action = "🔥 NHIỆM VỤ: Nhắm mắt lại 10 giây, hít thở sâu và ghi nhớ trọn vẹn cảm giác tự hào này. Cơ thể bạn sẽ ghiền cảm giác chiến thắng này đấy!";
    } 
    else if (context === 'creative_flow') {
        timelineA = "⚠️ CẢNH BÁO: Đừng để ngọn lửa sáng tạo này vụt tắt. Thế giới luôn cần góc nhìn độc bản của bạn."; 
        timelineB = "🌟 KHAI SÁNG: Mỗi tác phẩm hay ý tưởng được sinh ra đều là một bước tiến gần hơn đến Bản Thể Hoàn Mỹ.";
        msg = "📩 TỪ 2035: \"Sự sáng tạo của cậu ngày hôm nay thực sự đã truyền cảm hứng mạnh mẽ cho tôi ở tương lai. Cứ tiếp tục nhé!\""; 
        action = "🔥 NHIỆM VỤ: Hãy lưu giữ cẩn thận thành quả hoặc cảm hứng này. Tự hào vì bạn đã tạo ra một thứ gì đó mang đậm dấu ấn cá nhân.";
    }
    else if (context === 'workout') {
        timelineA = "⚠️ CẢNH BÁO: Bỏ bê cơ thể là tội ác lớn nhất với bản thể của chính mình."; 
        timelineB = "🌟 ĐỘT PHÁ: Từng thớ cơ đang được xé rạn để tái tạo mạnh mẽ hơn. Thể chất vĩ đại là nền tảng của trí tuệ vĩ đại.";
        msg = "📩 TỪ 2035: \"Nhờ những buổi đổ mồ hôi của cậu hôm nay, mà tôi ở tương lai đang sở hữu một cỗ máy sinh học hoàn hảo. Cảm ơn nhé!\""; 
        action = "🔥 NHIỆM VỤ: Hãy uống ngay một cốc nước lớn, nạp protein và cảm nhận dòng máu đang cuộn chảy trong cơ thể!";
    }
    else {
        timelineA = "⚠️ TRUNG BÌNH: Đừng quá an toàn. Sự ổn định là kẻ thù của sự vĩ đại."; 
        timelineB = "🌟 TIỀM NĂNG: Đây là lúc để bứt phá giới hạn bản thân.";
        msg = "📩 TỪ 2035: \"Hãy làm một điều gì đó khác biệt đi.\""; 
        action = "🔥 NHIỆM VỤ: Thử thách bản thân làm một việc bạn chưa từng làm.";
    }

    let html = `<div class='timeline-box timeline-a'>${timelineA}</div>
                <div class='timeline-box timeline-b'>${timelineB}</div>
                <div class='future-msg'>${msg}</div>
                <div style='margin-top:15px; color:var(--neon-yellow); font-weight:bold'>${action}</div>`;
    display.innerHTML = html;
    playTyping(0.3);
}

// ======================================================
// 9. BÁO ĐỘNG ĐỎ (CRITICAL WARNING)
// ======================================================
function checkCriticalStats(stats) {
    let warningMessages = [];
    if (stats.psych <= 0) warningMessages.push("<strong style='color:var(--neon-green);'>TÂM LÝ (0%):</strong> BẠN ĐANG SUY SỤP! Hãy dừng lại mọi thứ. Việc ưu tiên số 1 lúc này là ổn định lại cảm xúc.");
    if (stats.create <= 0) warningMessages.push("<strong style='color:var(--neon-orange);'>SÁNG TẠO (0%):</strong> TƯ DUY ĐÓNG BĂNG. Máy móc lặp lại. Hãy bỏ màn hình xuống và đi dạo ngay.");
    if (stats.bio <= 0) warningMessages.push("<strong style='color:var(--neon-red);'>THỂ CHẤT (0%):</strong> CƠ THỂ SẬP NGUỒN! Hệ thống sinh học đang cảnh báo nguy hiểm. TẮT MÁY VÀ ĐI NGỦ!");
    if (stats.disc <= 0) warningMessages.push("<strong style='color:var(--neon-yellow);'>KỶ LUẬT (0%):</strong> MẤT KIỂM SOÁT HOÀN TOÀN. Hãy thức tỉnh trước khi quá muộn.");
    if (stats.logic <= 0) warningMessages.push("<strong style='color:var(--neon-blue);'>TRÍ TUỆ (0%):</strong> NÃO BỘ NGỪNG PHÁT TRIỂN. Thế giới đang bỏ bạn lại phía sau.");

    if (warningMessages.length > 0) {
        setTimeout(() => {
            document.getElementById('warningText').innerHTML = warningMessages.join("<br><br>");
            document.getElementById('criticalWarning').style.display = 'flex';
            playAlarm();
        }, 1500);
    }
}
function closeWarning() { document.getElementById('criticalWarning').style.display = 'none'; }

// ======================================================
// 10. LÕI KÝ ỨC (QUANTUM MEMORY ARCHIVE)
// ======================================================
function saveMemory(text, context) {
    if (!currentUser) return;
    let storedData = JSON.parse(localStorage.getItem("user_" + currentUser));
    if (!storedData) return;
    if (!storedData.history) storedData.history = []; 
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN') + " - " + now.toLocaleTimeString('vi-VN');
    
    let contextName = ""; let contextClass = "ctx-lazy";
    if (context === 'growth') { contextName = "THĂNG HOA & TIẾN HÓA"; contextClass = "ctx-growth"; }
    else if (context === 'workout') { contextName = "RÈN LUYỆN THỂ CHẤT"; contextClass = "ctx-growth"; }
    else if (context === 'lazy') { contextName = "TRÌ HOÃN & LƯỜI BIẾNG"; contextClass = "ctx-lazy"; }
    else if (context === 'burnout') { contextName = "KIỆT SỨC & ÁP LỰC"; contextClass = "ctx-burnout"; }
    else if (context === 'emotional_crisis') { contextName = "KHỦNG HOẢNG TÂM LÝ"; contextClass = "ctx-emotional_crisis"; }
    else if (context === 'creative_flow') { contextName = "DÒNG CHẢY SÁNG TẠO"; contextClass = "ctx-creative_flow"; }
    else { contextName = "TRẠNG THÁI CÂN BẰNG"; contextClass = "ctx-growth"; }

    storedData.history.unshift({ date: dateStr, text: text, type: contextName, cssClass: contextClass });
    if (storedData.history.length > 50) storedData.history.pop();
    localStorage.setItem("user_" + currentUser, JSON.stringify(storedData));
}

function openMemory() {
    if (!currentUser) return;
    const storedData = JSON.parse(localStorage.getItem("user_" + currentUser));
    const listEl = document.getElementById('memoryList');
    listEl.innerHTML = ""; 

    if (!storedData || !storedData.history || storedData.history.length === 0) {
        listEl.innerHTML = "<div style='text-align:center; color:#888; margin-top: 30px; font-style: italic;'>Lõi ký ức trống rỗng. Hãy chia sẻ cảm xúc của bạn để kiến tạo dữ liệu.</div>";
    } else {
        storedData.history.forEach(mem => {
            const item = document.createElement('div');
            item.className = 'memory-item';
            item.innerHTML = `
                <div class='memory-date'>[TIMESTAMP: ${mem.date}]</div>
                <div class='memory-text'>“${mem.text}”</div>
                <div class='memory-result ${mem.cssClass}'>PHÂN TÍCH: ${mem.type}</div>
            `;
            listEl.appendChild(item);
        });
    }
    document.getElementById('memoryPopup').style.display = 'flex';
    try { playHover(); } catch(e){}
}
function closeMemory() { document.getElementById('memoryPopup').style.display = 'none'; }