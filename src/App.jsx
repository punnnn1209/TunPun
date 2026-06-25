import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  ClipboardList,
  Heart,
  Gift as GiftIcon,
  Wallet,
  Settings,
  X,
  Plus,
  Check,
  Flame,
  Lock,
  Trash2,
  Bell,
  Users,
  LogOut,
  Mail,
  Phone,
  AlertTriangle,
  Link2,
  KeyRound,
  Copy,
} from "lucide-react";
import {
  generateCoupleCode,
  coupleExists,
  createCouple,
  getCoupleData,
  subscribeCouple,
  saveCoupleData,
  setCouplePath,
  saveSession,
  loadSession,
  clearSession,
} from "./firebase";

/* ---------------------------------------------------------------------- */
/* Constants                                                               */
/* ---------------------------------------------------------------------- */

const APP_NAME = "Our Days";
const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700;800&display=swap');";
const DISPLAY_FONT = "'Quicksand', system-ui, sans-serif";
const BODY_FONT = "'Quicksand', system-ui, sans-serif";
const SCRIPT_FONT = "'Quicksand', system-ui, sans-serif";

const GIFT_THRESHOLD = 20;

const FLOWERS = [
  { id: "hong", emoji: "🌹", name: "Hoa hồng" },
  { id: "huongduong", emoji: "🌻", name: "Hoa hướng dương" },
  { id: "anhdao", emoji: "🌸", name: "Hoa anh đào" },
  { id: "tulip", emoji: "🌷", name: "Hoa tulip" },
  { id: "cuc", emoji: "🌼", name: "Hoa cúc" },
  { id: "sen", emoji: "🪷", name: "Hoa sen" },
  { id: "dambut", emoji: "🌺", name: "Hoa dâm bụt" },
];
const WILTED_EMOJI = "🥀";

const PROFILE_EMOJI_CHOICES = ["🐻", "🐰", "🐱", "🦊", "🐼", "🐶", "🦁", "🐨", "🐸", "🦄", "🐧", "🐯"];
const HABIT_EMOJI_CHOICES = ["🧘", "💪", "🎨", "🧹", "🛏️", "📓", "🎯", "🚿", "🍎", "🎵", "🐾", "🌱"];

const TASKS = [
  { id: "water", emoji: "💧", name: "Uống nước", unit: "cốc", step: 1, defaultTarget: 8 },
  { id: "move", emoji: "🚶‍♀️", name: "Đi bộ / Chạy", unit: "km", step: 0.5, defaultTarget: 3 },
  { id: "read", emoji: "📖", name: "Đọc sách", unit: "trang", step: 5, defaultTarget: 15 },
  {
    id: "vocab",
    emoji: "🔤",
    name: "Từ vựng mới",
    unit: "từ",
    step: 1,
    defaultTarget: 5,
    hasNote: true,
    notePlaceholder: "Ghi các từ đã học, cách nhau bằng dấu phẩy...",
  },
  { id: "meals", emoji: "🍱", name: "Ăn đủ bữa", unit: "bữa", step: 1, defaultTarget: 3, isMeals: true },
  {
    id: "screentime",
    emoji: "📱",
    name: "Giới hạn thời gian sử dụng màn hình",
    unit: "phút",
    step: 10,
    defaultTarget: 90,
    inverse: true,
    hint: "Mục tiêu này nên để người ấy đặt cho bạn nhé",
  },
];
const MEAL_LABELS = ["Sáng", "Trưa", "Tối"];

const TIME_SLOTS = [
  { id: "sang", label: "Buổi sáng", emoji: "🌅" },
  { id: "chieu", label: "Buổi chiều", emoji: "☀️" },
  { id: "toi", label: "Buổi tối", emoji: "🌙" },
];

const MOODS = [
  { id: "vui", emoji: "😄", label: "Vui vẻ", value: 95 },
  { id: "haohung", emoji: "🤩", label: "Hào hứng", value: 100 },
  { id: "binhthuong", emoji: "🙂", label: "Bình thường", value: 65 },
  { id: "met", emoji: "😴", label: "Mệt", value: 40 },
  { id: "chan", emoji: "😔", label: "Chán nản", value: 25 },
  { id: "stress", emoji: "😣", label: "Căng thẳng", value: 15 },
];

const WEATHERS = [
  { id: "nang", emoji: "☀️", label: "Nắng đẹp" },
  { id: "oi", emoji: "🥵", label: "Oi nóng" },
  { id: "mat", emoji: "⛅", label: "Mát mẻ" },
  { id: "mua", emoji: "🌧️", label: "Mưa" },
  { id: "lanh", emoji: "❄️", label: "Lạnh" },
  { id: "gio", emoji: "🌬️", label: "Gió nhiều" },
];

const RATING_OPTIONS = [
  { id: "xuatsac", label: "Xuất sắc", emoji: "🌟", mult: 1 },
  { id: "tot", label: "Tốt", emoji: "✅", mult: 0.7 },
  { id: "tam", label: "Tạm tạm", emoji: "🙂", mult: 0.4 },
];

const DEFAULT_URGENCY_LEVELS = ["Khẩn cấp 🚨", "Ngay lập tức ⚡", "Chill chill 🌿", "Khi nào tiện 🌙"];
const URGENCY_COLORS = {
  "Khẩn cấp 🚨": "bg-red-100 text-red-600 border-red-200",
  "Ngay lập tức ⚡": "bg-orange-100 text-orange-600 border-orange-200",
  "Chill chill 🌿": "bg-emerald-100 text-emerald-600 border-emerald-200",
  "Khi nào tiện 🌙": "bg-sky-100 text-sky-600 border-sky-200",
};
const DEFAULT_URGENCY_COLOR = "bg-gray-100 text-gray-500 border-gray-200";

const PRESET_GIFTS = [
  { text: "+5 phiếu bé ngoan tặng thêm 🌸", bonusTickets: 5 },
  { text: "+10 phiếu bé ngoan tặng thêm 🌸", bonusTickets: 10 },
  { text: "Đặc quyền chọn phim tối nay 🎬" },
  { text: "Một bữa sáng tại giường ☕🥐" },
  { text: "30 phút massage thư giãn 💆" },
  { text: "Một buổi đi chơi tự chọn 🎡" },
  { text: "Được ngủ nướng thêm 30 phút 😴" },
  { text: "Một lời khen thật ngọt ngào 💌" },
];

const SHARED_TEMPLATES = [
  { title: "Cùng tìm hiểu một chủ đề mới 📚", desc: "Đọc/xem video về chủ đề cả hai chưa biết, kể lại cho nhau nghe." },
  { title: "Chụp ít nhất 3 tấm ảnh kỷ niệm 📸", desc: "Chụp 3 khoảnh khắc đáng nhớ trong ngày hôm nay." },
  { title: "Nấu một món mới cùng nhau 🍳", desc: "Thử công thức chưa từng làm." },
  { title: "Đi dạo cùng nhau 30 phút 🌇", desc: "Tắt điện thoại, chỉ trò chuyện." },
  { title: "Viết cho nhau một lời nhắn yêu thương 💌", desc: "Không cần dài, chỉ cần thật." },
];

const EXPENSE_CATEGORIES = ["Ăn uống", "Di chuyển", "Mua sắm", "Giải trí", "Hoá đơn", "Sức khoẻ", "Khác"];

const COLORS = {
  p1: {
    solid: "bg-orange-400",
    solidHover: "hover:bg-orange-500",
    text: "text-orange-600",
    light: "bg-orange-50",
    ring: "ring-orange-300",
    border: "border-orange-200",
    chip: "bg-orange-100 text-orange-700",
  },
  p2: {
    solid: "bg-violet-400",
    solidHover: "hover:bg-violet-500",
    text: "text-violet-600",
    light: "bg-violet-50",
    ring: "ring-violet-300",
    border: "border-violet-200",
    chip: "bg-violet-100 text-violet-700",
  },
};

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 9);

function dateKeyFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function todayKey() {
  return dateKeyFromDate(new Date());
}
function offsetDateKey(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKeyFromDate(d);
}
function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(offsetDateKey(i));
  return out;
}
function dateLabel(dateKey) {
  try {
    const [y, m, d] = dateKey.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }).format(dt);
  } catch {
    return dateKey;
  }
}
function formatVND(n) {
  return (Number(n) || 0).toLocaleString("vi-VN") + "đ";
}
function otherOf(pid) {
  return pid === "p1" ? "p2" : "p1";
}
function nameOf(data, pid) {
  return data.profiles?.[pid]?.name || "người ấy";
}

function makeInitialCoupleData(p1Profile) {
  return {
    profiles: {
      p1: p1Profile,
      p2: { name: "", emoji: "", flower: "", login: "" },
    },
    targets: {
      p1: { water: 8, move: 3, read: 15, vocab: 5, meals: 3, screentime: 90 },
      p2: { water: 8, move: 3, read: 15, vocab: 5, meals: 3, screentime: 90 },
    },
    customHabits: { p1: [], p2: [] },
    dailyData: {},
    assignedTasks: [],
    sharedTasks: [],
    moods: {},
    gifts: [],
    bonusTickets: { p1: 0, p2: 0 },
    expenses: [],
    urgencyLevels: [...DEFAULT_URGENCY_LEVELS],
    dismissedAlerts: [],
  };
}

function getTasksForProfile(data, pid) {
  const customs = (data.customHabits?.[pid] || []).map((h) => ({ ...h, custom: true }));
  return [...TASKS, ...customs];
}

function calcRatio(task, entry, target) {
  if (!entry) return 0;
  if (task.isMeals) {
    const done = (entry.flags || []).filter(Boolean).length;
    return done / 3;
  }
  if (task.inverse) {
    const v = entry.value;
    if (v == null) return 0;
    if (v <= 0) return 1.5;
    return Math.min(1.5, target / Math.max(v, 1));
  }
  const v = entry.value || 0;
  if (!target || target <= 0) return 0;
  return v / target;
}

function getLevel(ratio) {
  if (ratio >= 1.2)
    return { label: "Xuất sắc", emoji: "🌟", tickets: 3, text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  if (ratio >= 1)
    return { label: "Hoàn thành", emoji: "✅", tickets: 2, text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (ratio >= 0.5)
    return { label: "Cố gắng", emoji: "🙂", tickets: 1, text: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" };
  if (ratio > 0)
    return { label: "Mới bắt đầu", emoji: "🌱", tickets: 0, text: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" };
  return { label: "Chưa làm", emoji: "⚪", tickets: 0, text: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200" };
}

function calcDayTickets(data, dateKey, pid) {
  let total = 0;
  const day = data.dailyData[dateKey]?.[pid];
  getTasksForProfile(data, pid).forEach((t) => {
    const entry = day?.[t.id];
    const target = data.targets[pid]?.[t.id] ?? t.defaultTarget;
    total += getLevel(calcRatio(t, entry, target)).tickets;
  });
  data.assignedTasks
    .filter((a) => a.dateKey === dateKey && a.assignedTo === pid && a.status === "done")
    .forEach((a) => (total += a.awardedTickets || 0));
  data.sharedTasks
    .filter((s) => s.completedDate === dateKey && s.doneBy?.p1 && s.doneBy?.p2)
    .forEach((s) => (total += s.ticketValue || 0));
  return total;
}

function calcTotalTickets(data, pid) {
  const dateKeys = new Set([
    ...Object.keys(data.dailyData),
    ...data.assignedTasks.map((a) => a.dateKey),
    ...data.sharedTasks.filter((s) => s.completedDate).map((s) => s.completedDate),
  ]);
  let total = 0;
  dateKeys.forEach((dk) => (total += calcDayTickets(data, dk, pid)));
  total += data.bonusTickets?.[pid] || 0;
  return total;
}

function calcStreak(data, pid) {
  let streak = 0;
  const todayPts = calcDayTickets(data, todayKey(), pid);
  for (let i = 1; i < 365; i++) {
    const dk = offsetDateKey(i);
    if (calcDayTickets(data, dk, pid) > 0) streak += 1;
    else break;
  }
  if (todayPts > 0) streak += 1;
  return streak;
}

function getRankTitle(tickets) {
  if (tickets < 15) return "Tân binh đáng yêu 🐣";
  if (tickets < 40) return "Người yêu chăm chỉ 🌱";
  if (tickets < 90) return "Cao thủ tự giác 🔥";
  if (tickets < 180) return "Phải chăng là định mệnh 👑";
  return "Happy Ending 💞";
}

function availableOpens(data, pid) {
  const opened = data.gifts.filter((g) => g.forProfile === pid && g.opened).length;
  const total = calcTotalTickets(data, pid);
  return Math.max(0, Math.floor(total / GIFT_THRESHOLD) - opened);
}

function moodFreshnessScore(data, dateKey, pid) {
  const slots = TIME_SLOTS.map((s) => data.moods[dateKey]?.[pid]?.[s.id]?.mood).filter(Boolean);
  if (slots.length === 0) return null;
  const vals = slots.map((id) => MOODS.find((m) => m.id === id)?.value ?? 50);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function freshnessStage(score, flowerEmoji) {
  const flower = flowerEmoji || "🌸";
  if (score == null) return { emoji: flower, label: "Chưa cập nhật hôm nay", scale: "scale-100", opacity: "opacity-40", gray: "" };
  if (score >= 80) return { emoji: flower, label: "Tươi rực rỡ ngát hương", scale: "scale-110", opacity: "opacity-100", gray: "" };
  if (score >= 60) return { emoji: flower, label: "Tươi tắn", scale: "scale-100", opacity: "opacity-100", gray: "" };
  if (score >= 40) return { emoji: flower, label: "Hơi mệt mỏi", scale: "scale-100", opacity: "opacity-80", gray: "" };
  if (score >= 15) return { emoji: flower, label: "Hơi héo, cần quan tâm", scale: "scale-90", opacity: "opacity-70", gray: "grayscale" };
  return { emoji: WILTED_EMOJI, label: "Héo úa rồi, cần được chăm sóc 💧", scale: "scale-90", opacity: "opacity-90", gray: "" };
}

function computeAlerts(data) {
  const alerts = [];
  ["p1", "p2"].forEach((pid) => {
    const tasks = getTasksForProfile(data, pid);
    tasks.forEach((t) => {
      if (t.createdAt && t.createdAt > offsetDateKey(3)) return;
      const days = [1, 2, 3].map((n) => offsetDateKey(n));
      const ratios = days.map((dk) => {
        const target = data.targets[pid]?.[t.id] ?? t.defaultTarget;
        return calcRatio(t, data.dailyData[dk]?.[pid]?.[t.id], target);
      });
      if (ratios.every((r) => r < 0.5)) {
        const alertId = `${pid}-${t.id}-${days[0]}`;
        if (!data.dismissedAlerts.includes(alertId)) {
          alerts.push({ id: alertId, profileId: pid, taskId: t.id, taskName: t.name, taskEmoji: t.emoji });
        }
      }
    });
  });
  return alerts;
}

/* ---------------------------------------------------------------------- */
/* UI atoms                                                                */
/* ---------------------------------------------------------------------- */

function ProgressBar({ ratio, colorClass }) {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  return (
    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function LevelBadge({ ratio }) {
  const lvl = getLevel(ratio);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${lvl.bg} ${lvl.text} ${lvl.border}`}>
      <span>{lvl.emoji}</span>
      {lvl.label}
    </span>
  );
}

function TicketBadge({ count, flowerEmoji }) {
  return (
    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-sm font-bold border border-amber-100">
      <span>{flowerEmoji || "🌸"}</span> {count} phiếu
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Celebration overlay                                                    */
/* ---------------------------------------------------------------------- */

const CELEBRATION_PALETTE = ["bg-rose-300", "bg-amber-300", "bg-sky-300", "bg-violet-300", "bg-emerald-300", "bg-pink-300"];
const HEART_EMOJIS = ["💕", "💖", "💗", "❤️", "💞"];
const CELEBRATION_TYPES = ["confetti", "bloom", "kiss", "firework", "hearts", "sparkle", "rainbow", "balloon", "butterfly", "medal"];

function randomColor() {
  return CELEBRATION_PALETTE[Math.floor(Math.random() * CELEBRATION_PALETTE.length)];
}

function floatItems(count, emoji, pool) {
  return Array.from({ length: count }, () => ({
    left: 8 + Math.random() * 84,
    delay: Math.random() * 0.6,
    emoji: emoji || pool[Math.floor(Math.random() * pool.length)],
  }));
}

function burstItems(count, spread = 110) {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = spread * (0.6 + Math.random() * 0.4);
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, delay: Math.random() * 0.25, color: randomColor() };
  });
}

function buildEffectData(type, flower) {
  switch (type) {
    case "confetti":
      return {
        pieces: Array.from({ length: 24 }, () => ({
          left: Math.random() * 100,
          size: `${6 + Math.random() * 8}px`,
          delay: Math.random() * 0.4,
          color: randomColor(),
        })),
      };
    case "bloom":
      return { centerEmoji: flower };
    case "kiss":
      return { items: floatItems(7, "💋") };
    case "firework":
      return { bursts: burstItems(18, 120) };
    case "hearts":
      return { items: floatItems(9, null, HEART_EMOJIS) };
    case "sparkle":
      return {
        stars: Array.from({ length: 16 }, () => ({
          left: Math.random() * 100,
          top: 8 + Math.random() * 78,
          delay: Math.random() * 1.2,
          size: 14 + Math.random() * 16,
        })),
      };
    case "rainbow":
      return { centerEmoji: "🌈" };
    case "balloon":
      return { items: floatItems(8, "🎈") };
    case "butterfly":
      return { items: Array.from({ length: 6 }, () => ({ top: 10 + Math.random() * 70, delay: Math.random() * 0.9 })) };
    case "medal":
      return { centerEmoji: "🏆", ring: burstItems(10, 100) };
    default:
      return {};
  }
}

function makeCelebration(flowerEmoji) {
  const flower = flowerEmoji || "🌸";
  const type = CELEBRATION_TYPES[Math.floor(Math.random() * CELEBRATION_TYPES.length)];
  return { key: uid(), type, flower, data: buildEffectData(type, flower) };
}

function CelebrationOverlay({ celebration }) {
  if (!celebration) return null;
  const { type, data } = celebration;
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {type === "confetti" &&
        data.pieces.map((p, i) => (
          <span
            key={i}
            className={`absolute rounded-full ${p.color}`}
            style={{ left: `${p.left}%`, top: "-5%", width: p.size, height: p.size, animation: `confettiFall 2.6s ease-in ${p.delay}s forwards` }}
          />
        ))}

      {(type === "bloom" || type === "rainbow" || type === "medal") && (
        <div className="absolute left-1/2 top-1/2 text-7xl" style={{ transform: "translate(-50%,-50%)", animation: "bloomPop 1.1s ease-out forwards" }}>
          {data.centerEmoji}
        </div>
      )}

      {type === "medal" &&
        data.ring.map((r, i) => (
          <span
            key={i}
            className="absolute text-xl left-1/2 top-1/2"
            style={{ "--dx": `${r.dx}px`, "--dy": `${r.dy}px`, animation: `burstOut 1.3s ease-out ${r.delay}s forwards` }}
          >
            ✨
          </span>
        ))}

      {(type === "kiss" || type === "hearts") &&
        data.items.map((it, i) => (
          <span key={i} className="absolute text-2xl" style={{ left: `${it.left}%`, bottom: "9%", animation: `floatUp 2.8s ease-out ${it.delay}s forwards` }}>
            {it.emoji}
          </span>
        ))}

      {type === "balloon" &&
        data.items.map((it, i) => (
          <span key={i} className="absolute text-3xl" style={{ left: `${it.left}%`, bottom: "0%", animation: `floatUp 3.2s ease-out ${it.delay}s forwards` }}>
            {it.emoji}
          </span>
        ))}

      {type === "firework" &&
        data.bursts.map((b, i) => (
          <span
            key={i}
            className={`absolute rounded-full left-1/2 top-1/2 ${b.color}`}
            style={{ width: 8, height: 8, "--dx": `${b.dx}px`, "--dy": `${b.dy}px`, animation: `burstOut 1.1s ease-out ${b.delay}s forwards` }}
          />
        ))}

      {type === "sparkle" &&
        data.stars.map((s, i) => (
          <span key={i} className="absolute" style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, animation: `twinkle 1.3s ease-in-out ${s.delay}s forwards` }}>
            ✨
          </span>
        ))}

      {type === "butterfly" &&
        data.items.map((it, i) => (
          <span key={i} className="absolute text-2xl" style={{ top: `${it.top}%`, left: 0, animation: `flutter 2.6s ease-in-out ${it.delay}s forwards` }}>
            🦋
          </span>
        ))}
    </div>
  );
}
const AMBIENT_TYPES = ["cat", "kiss", "bunny", "paw"];

function AmbientCritters() {
  const [critter, setCritter] = useState(null);

  useEffect(() => {
    let timer;
    const schedule = () => {
      const delay = 25000 + Math.random() * 30000; // 25–55s mới có 1 lần, cố tình để thưa
      timer = setTimeout(() => {
        const type = AMBIENT_TYPES[Math.floor(Math.random() * AMBIENT_TYPES.length)];
        const key = uid();
        setCritter({ key, type });
        setTimeout(() => setCritter(null), 6000);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  if (!critter) return null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {critter.type === "cat" && (
        <span key={critter.key} className="absolute bottom-16 text-3xl" style={{ animation: "catRun 6s ease-in-out forwards" }}>
          🐱
        </span>
      )}
      {critter.type === "bunny" && (
        <span key={critter.key} className="absolute bottom-16 text-3xl" style={{ animation: "bunnyHop 5s ease-in-out forwards" }}>
          🐰
        </span>
      )}
      {critter.type === "kiss" && (
        <span key={critter.key} className="absolute top-20 right-6 text-3xl" style={{ animation: "kissWave 3.2s ease-in-out forwards" }}>
          😘
        </span>
      )}
      {critter.type === "paw" && (
        <div key={critter.key}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="absolute bottom-20 text-base opacity-0"
              style={{ left: `${10 + i * 15}%`, animation: `pawPrint 0.5s ease-out ${i * 0.35}s forwards` }}
            >
              🐾
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Login / Onboarding                                                     */
/* ---------------------------------------------------------------------- */

function BlobBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-rose-200 opacity-40 blur-3xl" />
      <div className="absolute top-1/3 -right-12 w-64 h-64 rounded-full bg-amber-200 opacity-40 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-violet-200 opacity-30 blur-3xl" />
    </div>
  );
}

function ProfileSetupForm({ initial, accentText, accentBorder, onSubmit, submitLabel }) {
  const [name, setName] = useState(initial?.name || "");
  const [emoji, setEmoji] = useState(initial?.emoji || PROFILE_EMOJI_CHOICES[0]);
  const [flower, setFlower] = useState(initial?.flower || FLOWERS[0].id);

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
      <label className={`text-xs font-bold uppercase ${accentText}`}>Tên của bạn</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="VD: Bống"
        className="w-full mt-1 mb-3 rounded-xl border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
      />
      <div className="text-xs font-bold text-gray-400 uppercase mb-1.5">Avatar</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {PROFILE_EMOJI_CHOICES.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`text-xl w-9 h-9 rounded-full flex items-center justify-center border-2 ${
              emoji === e ? `${accentBorder} bg-gray-50` : "border-transparent"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="text-xs font-bold text-gray-400 uppercase mb-1.5">Hoa yêu thích (dùng cho phiếu bé ngoan & cảm xúc)</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {FLOWERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFlower(f.id)}
            className={`flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full border-2 ${
              flower === f.id ? `${accentBorder} bg-gray-50` : "border-gray-200"
            }`}
          >
            <span>{f.emoji}</span>
            {f.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit({ name: name.trim(), emoji, flower })}
        disabled={!name.trim()}
        className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-40 text-white font-bold py-3 rounded-2xl shadow-sm transition-colors"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {submitLabel}
      </button>
    </div>
  );
}

function ContactField({ method, setMethod, contact, setContact }) {
  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-4">
      <div className="text-xs font-bold text-gray-400 uppercase mb-2">Thông tin liên hệ của bạn</div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMethod("gmail")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold border ${
            method === "gmail" ? "bg-rose-50 border-rose-300 text-rose-500" : "border-gray-200 text-gray-400"
          }`}
        >
          <Mail size={15} /> Gmail
        </button>
        <button
          onClick={() => setMethod("phone")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold border ${
            method === "phone" ? "bg-rose-50 border-rose-300 text-rose-500" : "border-gray-200 text-gray-400"
          }`}
        >
          <Phone size={15} /> Số điện thoại
        </button>
      </div>
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder={method === "gmail" ? "ten@gmail.com" : "09xxxxxxxx"}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
      />
      <p className="text-[11px] text-gray-400 mt-1.5">* Chỉ để hiển thị trong hồ sơ, không dùng để đăng nhập — phòng của bạn được bảo vệ bằng mã kết nối riêng.</p>
    </div>
  );
}

function WelcomeScreen({ onPickCreate, onPickJoin }) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-5xl mb-3">💌</div>
        <h1 className="text-3xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          {APP_NAME}
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center max-w-xs">
          Mọi sự thay đổi đều khó khăn lúc ban đầu, lộn xộn ở giữa và tuyệt đẹp ở cuối 🎁
        </p>
        <button
          onClick={onPickCreate}
          className="w-full max-w-sm bg-rose-400 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-sm mb-3 flex items-center justify-center gap-2"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          <Link2 size={18} /> Tạo phòng mới
        </button>
        <button
          onClick={onPickJoin}
          className="w-full max-w-sm bg-white border border-rose-200 text-rose-500 font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          <KeyRound size={18} /> Tham gia bằng mã
        </button>
      </div>
    </div>
  );
}

function CreateRoomScreen({ onBack, onCreated }) {
  const [method, setMethod] = useState("gmail");
  const [contact, setContact] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <button onClick={onBack} className="self-start mb-3 text-xs font-bold text-gray-400">
          ← Quay lại
        </button>
        <div className="text-4xl mb-2">🏡</div>
        <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          Tạo phòng của hai bạn
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Điền thông tin của bạn, app sẽ tạo một mã riêng để người ấy tham gia.</p>

        <ContactField method={method} setMethod={setMethod} contact={contact} setContact={setContact} />
        {error && <div className="text-xs text-rose-500 font-bold mb-2 text-center">{error}</div>}

        <ProfileSetupForm
          accentText="text-rose-500"
          accentBorder="border-rose-400"
          submitLabel={creating ? "Đang tạo phòng..." : "Tạo phòng & tiếp tục 💞"}
          onSubmit={async ({ name, emoji, flower }) => {
            if (creating) return;
            setCreating(true);
            setError("");
            try {
              const profile = { name, emoji, flower, login: contact.trim().toLowerCase() };
              let code = generateCoupleCode();
              for (let i = 0; i < 6 && (await coupleExists(code)); i++) code = generateCoupleCode();
              await createCouple(code, makeInitialCoupleData(profile));
              onCreated(code);
            } catch (e) {
              setError("Không tạo được phòng, kiểm tra kết nối mạng và thử lại nhé.");
              setCreating(false);
            }
          }}
        />
      </div>
    </div>
  );
}

function RoomCodeReveal({ code, onContinue }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available; ignore
    }
  };
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          Phòng của bạn đã sẵn sàng!
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Gửi mã này cho người ấy để cùng tham gia {APP_NAME} 💌</p>

        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-rose-100 p-6 text-center mb-4">
          <div className="text-4xl font-extrabold tracking-[0.3em] text-rose-500 mb-3" style={{ fontFamily: DISPLAY_FONT }}>
            {code}
          </div>
          <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-50 px-3 py-1.5 rounded-full">
            <Copy size={13} /> {copied ? "Đã sao chép!" : "Sao chép mã"}
          </button>
        </div>

        <button
          onClick={onContinue}
          className="w-full max-w-sm bg-rose-400 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-sm"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          Vào app ngay 🚀
        </button>
      </div>
    </div>
  );
}

function JoinRoomScreen({ onBack, onJoined }) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [validRoom, setValidRoom] = useState(null);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("gmail");
  const [contact, setContact] = useState("");
  const [joining, setJoining] = useState(false);

  const checkCode = async () => {
    const val = code.trim().toUpperCase();
    if (val.length < 4) return;
    setChecking(true);
    setError("");
    try {
      const roomData = await getCoupleData(val);
      if (!roomData) {
        setError("Không tìm thấy phòng với mã này, kiểm tra lại nhé 💌");
      } else if (roomData.profiles?.p2?.name) {
        setError("Phòng này đã có đủ hai người rồi 💞");
      } else {
        setValidRoom(val);
      }
    } catch {
      setError("Không kiểm tra được mã, thử lại nhé.");
    } finally {
      setChecking(false);
    }
  };

  if (validRoom) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-violet-50 via-rose-50 to-amber-50">
        <BlobBackground />
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="text-4xl mb-2">👋</div>
          <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
            Chào người ấy!
          </h1>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Hoàn tất hồ sơ của bạn để bắt đầu cùng nhau trên {APP_NAME} 💞</p>

          <ContactField method={method} setMethod={setMethod} contact={contact} setContact={setContact} />

          <ProfileSetupForm
            accentText="text-violet-500"
            accentBorder="border-violet-400"
            submitLabel={joining ? "Đang tham gia..." : "Hoàn tất, vào app 🚀"}
            onSubmit={async ({ name, emoji, flower }) => {
              if (joining) return;
              setJoining(true);
              try {
                const profile = { name, emoji, flower, login: contact.trim().toLowerCase() };
                await setCouplePath(validRoom, "profiles/p2", profile);
                onJoined(validRoom);
              } catch {
                setJoining(false);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-violet-50 via-rose-50 to-amber-50">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <button onClick={onBack} className="self-start mb-3 text-xs font-bold text-gray-400">
          ← Quay lại
        </button>
        <div className="text-4xl mb-2">🔑</div>
        <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          Tham gia phòng
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Nhập mã 6 ký tự mà người ấy đã gửi cho bạn.</p>

        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="VD: K7XQ2P"
            maxLength={8}
            className="w-full text-center text-2xl font-extrabold tracking-[0.2em] rounded-xl border border-gray-200 px-3 py-3 text-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 mb-2"
            style={{ fontFamily: DISPLAY_FONT }}
          />
          {error && <div className="text-xs text-rose-500 font-bold mb-2 text-center">{error}</div>}
          <button
            onClick={checkCode}
            disabled={checking}
            className="w-full bg-violet-400 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-sm"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {checking ? "Đang kiểm tra..." : "Tiếp tục"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Header + Bottom nav + Alerts                                           */
/* ---------------------------------------------------------------------- */

function Header({ data, activeProfile, onOpenSettings, onOpenAlerts, alertCount }) {
  const active = activeProfile;
  const other = otherOf(active);
  const tickets = calcTotalTickets(data, active);
  const streak = calcStreak(data, active);
  const col = COLORS[active];
  const flowerEmoji = FLOWERS.find((f) => f.id === data.profiles[active].flower)?.emoji;

  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-extrabold text-rose-500" style={{ fontFamily: DISPLAY_FONT }}>
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onOpenAlerts} className="relative p-2 rounded-full text-gray-400 hover:bg-gray-100">
            <Bell size={19} />
            {alertCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
          <button onClick={onOpenSettings} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
            <Settings size={19} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full border ${col.border} ${col.light}`}>
          <span className="text-xl">{data.profiles[active].emoji}</span>
          <span className={`text-sm font-bold ${col.text}`}>{data.profiles[active].name}</span>
        </div>
        <div className="text-xs text-gray-400 font-semibold">{getRankTitle(tickets)}</div>
      </div>

      <div className="flex items-center gap-2 mt-2.5">
        <TicketBadge count={tickets} flowerEmoji={flowerEmoji} />
        <div className="flex items-center gap-1 bg-rose-50 text-rose-500 px-2.5 py-1 rounded-full text-sm font-bold">
          <Flame size={14} /> {streak} ngày
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, pendingCount }) {
  const items = [
    { id: "today", icon: Home, label: "Hôm nay" },
    { id: "tasks", icon: ClipboardList, label: "Nhiệm vụ", badge: pendingCount },
    { id: "mood", icon: Heart, label: "Cảm xúc" },
    { id: "gift", icon: GiftIcon, label: "Phần thưởng" },
    { id: "finance", icon: Wallet, label: "Thu chi" },
  ];
  return (
    <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 flex justify-around px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl active:scale-95 transition-transform ${
              isActive ? "text-rose-500" : "text-gray-400"
            }`}
          >
            <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{it.label}</span>
            {!!it.badge && (
              <span className="absolute -top-0.5 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AlertsPanel({ data, setData, activeProfile, onClose }) {
  const active = activeProfile;
  const alerts = computeAlerts(data).filter((a) => a.profileId !== active);
  const [drafts, setDrafts] = useState({});

  const dismiss = (alertId) => {
    setData((prev) => ({ ...prev, dismissedAlerts: [...prev.dismissedAlerts, alertId] }));
  };

  const createFromAlert = (alert) => {
    const d = drafts[alert.id] || {};
    const urgency = d.urgency || data.urgencyLevels[0];
    const ticketValue = d.ticketValue ?? 5;
    setData((prev) => ({
      ...prev,
      assignedTasks: [
        ...prev.assignedTasks,
        {
          id: uid(),
          dateKey: todayKey(),
          assignedBy: active,
          assignedTo: alert.profileId,
          title: `Cùng cố gắng hơn với: ${alert.taskName} ${alert.taskEmoji}`,
          note: "Được gợi ý từ phân tích 3 ngày gần đây",
          ticketValue: Number(ticketValue) || 5,
          urgency,
          status: "pending",
        },
      ],
      dismissedAlerts: [...prev.dismissedAlerts, alert.id],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-extrabold text-gray-700 text-lg flex items-center gap-1.5" style={{ fontFamily: DISPLAY_FONT }}>
            <Bell size={18} className="text-rose-400" /> Thông báo
          </div>
          <button onClick={onClose} className="text-gray-400 p-1">
            <X size={22} />
          </button>
        </div>

        {alerts.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-6">
            Chưa có cảnh báo nào — mọi thứ vẫn đang ổn 🌿
          </div>
        )}

        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle size={16} className="text-rose-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <span className="font-bold">{data.profiles[a.profileId].name}</span> đã làm "{a.taskName}" {a.taskEmoji} ở
                  mức thấp 3 ngày liên tiếp. Gợi ý tạo nhiệm vụ nhắc nhở nhé?
                </div>
              </div>
              <div className="flex gap-2 mb-2">
                <select
                  value={drafts[a.id]?.urgency || data.urgencyLevels[0]}
                  onChange={(e) => setDrafts((p) => ({ ...p, [a.id]: { ...p[a.id], urgency: e.target.value } }))}
                  className="flex-1 text-xs font-bold rounded-lg border border-gray-200 px-2 py-1.5"
                >
                  {data.urgencyLevels.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={drafts[a.id]?.ticketValue ?? 5}
                  onChange={(e) => setDrafts((p) => ({ ...p, [a.id]: { ...p[a.id], ticketValue: e.target.value } }))}
                  className="w-16 text-xs font-bold rounded-lg border border-gray-200 px-2 py-1.5 text-center"
                  min={1}
                  max={20}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => createFromAlert(a)}
                  className="flex-1 bg-rose-400 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-lg"
                >
                  Tạo nhiệm vụ nhắc nhở
                </button>
                <button
                  onClick={() => dismiss(a.id)}
                  className="px-3 text-xs font-bold py-2 rounded-lg bg-white border border-gray-200 text-gray-400"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Today tab                                                               */
/* ---------------------------------------------------------------------- */

function AddHabitForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(HABIT_EMOJI_CHOICES[0]);
  const [unit, setUnit] = useState("lần");
  const [target, setTarget] = useState(1);
  const [step, setStep] = useState(1);
  const [inverse, setInverse] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-dashed border-rose-200 p-3.5 space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên thói quen, VD: Tập yoga"
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-1.5">
        {HABIT_EMOJI_CHOICES.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`text-lg w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              emoji === e ? "border-rose-400 bg-rose-50" : "border-transparent"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Đơn vị (phút, lần...)"
          className="flex-1 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs"
        />
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          placeholder="Mục tiêu"
          className="w-20 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs"
        />
        <input
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          placeholder="Bước nhảy"
          className="w-20 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs"
        />
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
        <input type="checkbox" checked={inverse} onChange={(e) => setInverse(e.target.checked)} />
        Thói quen "càng ít càng tốt" (VD: hút thuốc, ăn vặt)
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!name.trim()) return;
            onAdd({
              id: `custom-${uid()}`,
              emoji,
              name: name.trim(),
              unit: unit.trim() || "lần",
              defaultTarget: target || 1,
              step: step || 1,
              inverse,
              createdAt: todayKey(),
            });
          }}
          className="flex-1 bg-rose-400 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-lg"
        >
          Thêm thói quen
        </button>
        <button onClick={onCancel} className="px-3 text-xs font-bold py-2 rounded-lg bg-gray-50 text-gray-400">
          Huỷ
        </button>
      </div>
    </div>
  );
}

function TodayTab({ data, setData, activeProfile, coupleId, onCelebrate }) {
  const active = activeProfile;
  const dk = todayKey();
  const col = COLORS[active];
  const day = data.dailyData[dk]?.[active] || {};
  const tasks = getTasksForProfile(data, active);
  const [showAddHabit, setShowAddHabit] = useState(false);

  const updateEntry = (taskId, updater) => {
    setData((prev) => {
      const next = structuredClone(prev);
      if (!next.dailyData[dk]) next.dailyData[dk] = {};
      if (!next.dailyData[dk][active]) next.dailyData[dk][active] = {};
      const current = next.dailyData[dk][active][taskId] || {};
      next.dailyData[dk][active][taskId] = updater(current);
      return next;
    });
  };

  const checkCelebrate = (task, oldEntry, newEntry, target) => {
    const oldRatio = calcRatio(task, oldEntry, target);
    const newRatio = calcRatio(task, newEntry, target);
    if (oldRatio < 1 && newRatio >= 1) {
      const flowerEmoji = FLOWERS.find((f) => f.id === data.profiles[active].flower)?.emoji;
      onCelebrate(flowerEmoji);
    }
  };

  const addHabit = (habit) => {
    setData((prev) => {
      const next = structuredClone(prev);
      if (!next.customHabits[active]) next.customHabits[active] = [];
      next.customHabits[active].push(habit);
      if (!next.targets[active]) next.targets[active] = {};
      next.targets[active][habit.id] = habit.defaultTarget;
      return next;
    });
    setShowAddHabit(false);
  };

  const removeHabit = (habitId) => {
    setData((prev) => ({
      ...prev,
      customHabits: { ...prev.customHabits, [active]: prev.customHabits[active].filter((h) => h.id !== habitId) },
    }));
  };

  const pendingForMe = data.assignedTasks.filter((a) => a.dateKey === dk && a.assignedTo === active && a.status === "pending");

  const rateAndComplete = (task, ratingId) => {
    const rating = RATING_OPTIONS.find((r) => r.id === ratingId);
    setData((prev) => {
      const next = structuredClone(prev);
      const t = next.assignedTasks.find((a) => a.id === task.id);
      if (t) {
        t.status = "done";
        t.level = rating.label;
        t.awardedTickets = Math.round(t.ticketValue * rating.mult);
      }
      return next;
    });
    const flowerEmoji = FLOWERS.find((f) => f.id === data.profiles[active].flower)?.emoji;
    onCelebrate(flowerEmoji);
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      {!data.profiles[otherOf(active)].name && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
          <div className="text-sm font-extrabold text-amber-600 mb-1">Người ấy chưa tham gia phòng 💌</div>
          <div className="text-xs text-amber-500">
            Gửi mã <span className="font-extrabold tracking-widest">{coupleId}</span> để cùng bắt đầu nhé
          </div>
        </div>
      )}
      {pendingForMe.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
          <div className="text-sm font-extrabold text-rose-500 mb-2 flex items-center gap-1">
            💌 {nameOf(data, otherOf(active))} giao cho bạn hôm nay
          </div>
          <div className="space-y-2">
            {pendingForMe.map((task) => (
              <PendingTaskCard key={task.id} task={task} urgencyColors={URGENCY_COLORS} onRate={(r) => rateAndComplete(task, r)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold text-gray-400 uppercase">Daily routine</div>
        <button onClick={() => setShowAddHabit((s) => !s)} className="text-xs font-bold text-rose-400 flex items-center gap-0.5">
          <Plus size={13} /> Thói quen riêng
        </button>
      </div>

      {showAddHabit && <AddHabitForm onAdd={addHabit} onCancel={() => setShowAddHabit(false)} />}

      <div className="space-y-3">
        {tasks.map((task) => {
          const entry = day[task.id];
          const target = data.targets[active]?.[task.id] ?? task.defaultTarget;
          const ratio = calcRatio(task, entry, target);
          return (
            <TaskCard
              key={task.id}
              task={task}
              entry={entry}
              target={target}
              ratio={ratio}
              col={col}
              onRemoveCustom={task.custom ? () => removeHabit(task.id) : null}
              onChange={(updater) => {
                const newEntry = updater(entry || {});
                checkCelebrate(task, entry, newEntry, target);
                updateEntry(task.id, () => newEntry);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function PendingTaskCard({ task, onRate, urgencyColors }) {
  const [rating, setRating] = useState(null);
  const urgencyClass = urgencyColors[task.urgency] || DEFAULT_URGENCY_COLOR;
  return (
    <div className="bg-white rounded-xl p-3 border border-rose-100">
      <div className="flex items-center justify-between">
        <div className="font-bold text-gray-700 text-sm">{task.title}</div>
        {task.urgency && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyClass}`}>{task.urgency}</span>}
      </div>
      {task.note && <div className="text-xs text-gray-400 mt-0.5">{task.note}</div>}
      <div className="text-xs text-amber-500 font-bold mt-1">🎯 {task.ticketValue} phiếu</div>
      {!rating ? (
        <div className="flex gap-1.5 mt-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRating(r.id);
                onRate(r.id);
              }}
              className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-xs font-bold text-emerald-500 mt-2">✅ Đã hoàn thành</div>
      )}
    </div>
  );
}

function TaskCard({ task, entry, target, ratio, col, onChange, onRemoveCustom }) {
  if (task.isMeals) {
    const flags = entry?.flags || [false, false, false];
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{task.emoji}</span>
            <span className="font-bold text-gray-700 text-sm">{task.name}</span>
          </div>
          <LevelBadge ratio={ratio} />
        </div>
        <div className="flex gap-2">
          {MEAL_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => {
                const newFlags = [...flags];
                newFlags[i] = !newFlags[i];
                onChange(() => ({ flags: newFlags }));
              }}
              className={`flex-1 text-xs font-bold py-2 rounded-xl border ${
                flags[i] ? `${col.solid} text-white border-transparent` : "bg-gray-50 text-gray-400 border-gray-200"
              }`}
            >
              {flags[i] ? "✓ " : ""}
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const value = entry?.value ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{task.emoji}</span>
          <span className="font-bold text-gray-700 text-sm">{task.name}</span>
          {task.custom && <span className="text-[10px] bg-rose-50 text-rose-400 font-bold px-1.5 py-0.5 rounded-full">riêng</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <LevelBadge ratio={ratio} />
          {onRemoveCustom && (
            <button onClick={onRemoveCustom} className="text-gray-300 hover:text-rose-400">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {task.hint && <div className="text-[11px] text-gray-400 mb-1.5">💡 {task.hint}</div>}

      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => onChange((c) => ({ ...c, value: Math.max(0, (c.value ?? 0) - task.step) }))}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center"
        >
          –
        </button>
        <div className="flex-1 text-center">
          <span className="text-lg font-extrabold text-gray-700">{value}</span>
          <span className="text-xs text-gray-400 font-bold"> / {target} {task.unit}</span>
        </div>
        <button
          onClick={() => onChange((c) => ({ ...c, value: (c.value ?? 0) + task.step }))}
          className={`w-8 h-8 rounded-full ${col.solid} text-white font-bold flex items-center justify-center`}
        >
          +
        </button>
      </div>

      <ProgressBar ratio={Math.min(1, ratio)} colorClass={col.solid} />

      {task.hasNote && (
        <textarea
          value={entry?.note || ""}
          onChange={(e) => onChange((c) => ({ ...c, note: e.target.value }))}
          placeholder={task.notePlaceholder}
          rows={2}
          className="w-full mt-2 text-xs rounded-xl border border-gray-200 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Tasks tab (Giao việc + Nhiệm vụ chung)                                  */
/* ---------------------------------------------------------------------- */

function AssignSection({ data, setData, activeProfile }) {
  const active = activeProfile;
  const other = otherOf(active);
  const dk = todayKey();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [ticketValue, setTicketValue] = useState(5);
  const [urgency, setUrgency] = useState(data.urgencyLevels[0]);

  const createTask = () => {
    if (!title.trim()) return;
    setData((prev) => ({
      ...prev,
      assignedTasks: [
        ...prev.assignedTasks,
        {
          id: uid(),
          dateKey: dk,
          assignedBy: active,
          assignedTo: other,
          title: title.trim(),
          note: note.trim(),
          ticketValue: Number(ticketValue) || 5,
          urgency,
          status: "pending",
        },
      ],
    }));
    setTitle("");
    setNote("");
    setTicketValue(5);
  };

  const removeTask = (id) => setData((prev) => ({ ...prev, assignedTasks: prev.assignedTasks.filter((t) => t.id !== id) }));

  const givenByMe = data.assignedTasks.filter((t) => t.dateKey === dk && t.assignedBy === active);
  const givenToMe = data.assignedTasks.filter((t) => t.dateKey === dk && t.assignedTo === active);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-sm font-extrabold text-gray-700 mb-3">✍️ Thử thách dành cho {nameOf(data, other)}</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên nhiệm vụ, VD: Dọn phòng trước 9h tối"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú thêm (không bắt buộc)"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <div className="flex items-center gap-2 mb-3">
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="flex-1 text-xs font-bold rounded-xl border border-gray-200 px-2 py-2">
            {data.urgencyLevels.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={ticketValue}
            onChange={(e) => setTicketValue(e.target.value)}
            className="w-16 rounded-xl border border-gray-200 px-2 py-2 text-sm text-center"
            min={1}
            max={20}
          />
          <span className="text-xs text-gray-400 font-bold">phiếu</span>
        </div>
        <button onClick={createTask} className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm">
          <Plus size={16} /> Tạo thử thách
        </button>
      </div>

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">{nameOf(data, other)} giao cho bạn</div>
        {givenToMe.length === 0 && <div className="text-sm text-gray-400 px-1">Chưa có thử thách nào hôm nay 🌤️</div>}
        <div className="space-y-2">
          {givenToMe.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-700 text-sm">{t.title}</div>
                {t.note && <div className="text-xs text-gray-400">{t.note}</div>}
                <div className="text-xs text-amber-500 font-bold">🎯 {t.ticketValue} phiếu</div>
              </div>
              {t.status === "done" ? (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Check size={14} /> {t.level}
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-400">Chờ làm</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">Bạn đã tạo</div>
        {givenByMe.length === 0 && <div className="text-sm text-gray-400 px-1">Chưa tạo gì hôm nay 📝</div>}
        <div className="space-y-2">
          {givenByMe.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-700 text-sm">{t.title}</div>
                <div className="text-xs text-amber-500 font-bold">🎯 {t.ticketValue} phiếu</div>
              </div>
              <div className="flex items-center gap-2">
                {t.status === "done" ? (
                  <span className="text-xs font-bold text-emerald-500">✅ {t.level}</span>
                ) : (
                  <span className="text-xs font-bold text-gray-400">Chờ làm</span>
                )}
                {t.status !== "done" && (
                  <button onClick={() => removeTask(t.id)} className="text-gray-300 hover:text-rose-400">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SharedSection({ data, setData, activeProfile, onCelebrate }) {
  const active = activeProfile;
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [ticketValue, setTicketValue] = useState(8);

  const addShared = (t) => {
    setData((prev) => ({
      ...prev,
      sharedTasks: [
        ...prev.sharedTasks,
        {
          id: uid(),
          title: t.title,
          desc: t.desc || "",
          ticketValue: t.ticketValue || 8,
          dateCreated: todayKey(),
          doneBy: { p1: false, p2: false },
          completedDate: null,
        },
      ],
    }));
  };

  const toggleDone = (taskId) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const t = next.sharedTasks.find((s) => s.id === taskId);
      if (!t) return prev;
      t.doneBy[active] = !t.doneBy[active];
      if (t.doneBy.p1 && t.doneBy.p2 && !t.completedDate) {
        t.completedDate = todayKey();
        const flowerEmoji = FLOWERS.find((f) => f.id === prev.profiles[active].flower)?.emoji;
        setTimeout(() => onCelebrate(flowerEmoji), 0);
      }
      return next;
    });
  };

  const ongoing = data.sharedTasks.filter((s) => !(s.doneBy.p1 && s.doneBy.p2));
  const done = data.sharedTasks.filter((s) => s.doneBy.p1 && s.doneBy.p2);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-sm font-extrabold text-gray-700 mb-2 flex items-center gap-1.5">
          <Users size={16} className="text-violet-400" /> Gợi ý nhiệm vụ chung sức
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SHARED_TEMPLATES.map((t) => (
            <button
              key={t.title}
              onClick={() => addShared(t)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100"
            >
              + {t.title}
            </button>
          ))}
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Hoặc tự tạo nhiệm vụ chung..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2"
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Mô tả thêm (không bắt buộc)"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2"
        />
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-gray-400">Phiếu cho mỗi người</span>
          <input
            type="number"
            value={ticketValue}
            onChange={(e) => setTicketValue(Number(e.target.value))}
            className="w-16 rounded-xl border border-gray-200 px-2 py-1.5 text-sm text-center"
          />
        </div>
        <button
          onClick={() => {
            if (!title.trim()) return;
            addShared({ title: title.trim(), desc: desc.trim(), ticketValue });
            setTitle("");
            setDesc("");
          }}
          className="w-full bg-violet-400 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5"
        >
          <Plus size={16} /> Tạo nhiệm vụ chung
        </button>
      </div>

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">Đang thực hiện</div>
        {ongoing.length === 0 && <div className="text-sm text-gray-400 px-1">Chưa có nhiệm vụ chung nào 🌷</div>}
        <div className="space-y-2">
          {ongoing.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="font-bold text-gray-700 text-sm">{t.title}</div>
              {t.desc && <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className={t.doneBy.p1 ? "text-orange-500" : "text-gray-300"}>{data.profiles.p1.emoji} {t.doneBy.p1 ? "Đã xong" : "Chưa xong"}</span>
                  <span className="text-gray-300">·</span>
                  <span className={t.doneBy.p2 ? "text-violet-500" : "text-gray-300"}>{data.profiles.p2.emoji} {t.doneBy.p2 ? "Đã xong" : "Chưa xong"}</span>
                </div>
                <button onClick={() => toggleDone(t.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${COLORS[active].solid} text-white`}>
                  {t.doneBy[active] ? "Bỏ đánh dấu" : "Mình xong rồi"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {done.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">Đã hoàn thành cùng nhau 🎉</div>
          <div className="space-y-1.5">
            {done.map((t) => (
              <div key={t.id} className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-sm text-gray-600">
                ✅ {t.title} <span className="text-emerald-500 font-bold">(+{t.ticketValue} phiếu mỗi người)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TasksTab({ data, setData, activeProfile, onCelebrate }) {
  const [sub, setSub] = useState("assign");
  return (
    <div className="px-4 py-4 pb-6">
      <div className="flex gap-2 mb-4 bg-gray-100 rounded-full p-1">
        <button
          onClick={() => setSub("assign")}
          className={`flex-1 text-xs font-bold py-2 rounded-full ${sub === "assign" ? "bg-white text-rose-500 shadow-sm" : "text-gray-400"}`}
        >
          Giao việc
        </button>
        <button
          onClick={() => setSub("shared")}
          className={`flex-1 text-xs font-bold py-2 rounded-full ${sub === "shared" ? "bg-white text-violet-500 shadow-sm" : "text-gray-400"}`}
        >
          Nhiệm vụ chung
        </button>
      </div>
      {sub === "assign" ? (
        <AssignSection data={data} setData={setData} activeProfile={activeProfile} />
      ) : (
        <SharedSection data={data} setData={setData} activeProfile={activeProfile} onCelebrate={onCelebrate} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Mood tab                                                                */
/* ---------------------------------------------------------------------- */

function MoodTab({ data, setData, activeProfile }) {
  const active = activeProfile;
  const dk = todayKey();
  const flowerEmoji = FLOWERS.find((f) => f.id === data.profiles[active].flower)?.emoji;
  const [slot, setSlot] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "sang";
    if (hour < 18) return "chieu";
    return "toi";
  });
  const entry = data.moods[dk]?.[active]?.[slot] || {};

  const update = (patch) => {
    setData((prev) => {
      const next = structuredClone(prev);
      if (!next.moods[dk]) next.moods[dk] = {};
      if (!next.moods[dk][active]) next.moods[dk][active] = {};
      next.moods[dk][active][slot] = { ...(next.moods[dk][active][slot] || {}), ...patch };
      return next;
    });
  };

  const score = moodFreshnessScore(data, dk, active);
  const stage = freshnessStage(score, flowerEmoji);
  const days = lastNDays(7);

  return (
    <div className="px-4 py-4 space-y-5 pb-6">
      <div className="rounded-3xl p-5 text-center bg-gradient-to-b from-rose-50 to-amber-50 border border-rose-100">
        <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Hoa cảm xúc hôm nay (tổng hợp từ 3 buổi)</div>
        <div className={`text-6xl mb-1 inline-block transition-all duration-500 ${stage.scale} ${stage.opacity} ${stage.gray}`}>
          {stage.emoji}
        </div>
        <div className="text-sm font-bold text-gray-600">{stage.label}</div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex gap-1.5 mb-4 bg-gray-100 rounded-full p-1">
          {TIME_SLOTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSlot(s.id)}
              className={`flex-1 text-xs font-bold py-2 rounded-full flex items-center justify-center gap-1 ${
                slot === s.id ? "bg-white text-rose-500 shadow-sm" : "text-gray-400"
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => update({ mood: m.id })}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border ${
                entry.mood === m.id ? "border-rose-300 bg-rose-50" : "border-gray-100"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[11px] font-bold text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Thời tiết</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {WEATHERS.map((w) => (
            <button
              key={w.id}
              onClick={() => update({ weather: w.id })}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                entry.weather === w.id ? "border-sky-300 bg-sky-50 text-sky-600" : "border-gray-200 text-gray-400"
              }`}
            >
              {w.emoji} {w.label}
            </button>
          ))}
        </div>

        <textarea
          value={entry.note || ""}
          onChange={(e) => update({ note: e.target.value })}
          placeholder={`Buổi ${TIME_SLOTS.find((s) => s.id === slot)?.label.toLowerCase()} của bạn có gì muốn kể? 📝`}
          rows={2}
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
          style={{ fontFamily: SCRIPT_FONT, fontSize: "16px" }}
        />
      </div>

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">7 ngày gần đây</div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {days.map((day) => {
            const s1 = freshnessStage(moodFreshnessScore(data, day, "p1"), FLOWERS.find((f) => f.id === data.profiles.p1.flower)?.emoji);
            const s2 = freshnessStage(moodFreshnessScore(data, day, "p2"), FLOWERS.find((f) => f.id === data.profiles.p2.flower)?.emoji);
            return (
              <div key={day} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-400 text-xs font-semibold w-16">{dateLabel(day)}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{s1.emoji}</span>
                  <span className="text-[11px] text-orange-400 font-bold">{data.profiles.p1.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{s2.emoji}</span>
                  <span className="text-[11px] text-violet-400 font-bold">{data.profiles.p2.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Gift tab                                                                */
/* ---------------------------------------------------------------------- */

function GiftTab({ data, setData, activeProfile, onReveal }) {
  const active = activeProfile;
  const other = otherOf(active);
  const [text, setText] = useState("");

  const myUnopened = data.gifts.filter((g) => g.forProfile === active && !g.opened);
  const myOpened = data.gifts.filter((g) => g.forProfile === active && g.opened);
  const iAdded = data.gifts.filter((g) => g.addedBy === active && g.forProfile === other);
  const opens = availableOpens(data, active);

  const addGift = (gift) => {
    setData((prev) => ({
      ...prev,
      gifts: [
        ...prev.gifts,
        { id: uid(), addedBy: active, forProfile: other, text: gift.text, bonusTickets: gift.bonusTickets || 0, opened: false, dateAdded: todayKey() },
      ],
    }));
  };

  const removeGift = (id) => setData((prev) => ({ ...prev, gifts: prev.gifts.filter((g) => g.id !== id) }));

  const openBox = () => {
    if (opens <= 0) {
      onReveal({ kind: "locked" });
      return;
    }
    if (myUnopened.length === 0) {
      onReveal({ kind: "empty" });
      return;
    }
    const pick = myUnopened[Math.floor(Math.random() * myUnopened.length)];
    setData((prev) => {
      const next = structuredClone(prev);
      const g = next.gifts.find((x) => x.id === pick.id);
      g.opened = true;
      g.dateOpened = todayKey();
      if (g.bonusTickets) next.bonusTickets[active] = (next.bonusTickets[active] || 0) + g.bonusTickets;
      return next;
    });
    onReveal({ kind: "gift", text: pick.text });
  };

  return (
    <div className="px-4 py-4 space-y-5 pb-6">
      <div className="rounded-3xl p-5 text-center border-2 border-dashed border-rose-200 bg-gradient-to-b from-rose-50 to-amber-50">
        <div className="text-4xl mb-1">🎁</div>
        <div className="font-extrabold text-gray-700" style={{ fontFamily: DISPLAY_FONT }}>
          Phần thưởng bí mật
        </div>
        <div className="text-xs text-gray-500 mt-1 mb-3">
          Cứ {GIFT_THRESHOLD} phiếu bạn lại được mở 1 phần quà bí mật từ {nameOf(data, other)} yêu 💌
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-full text-rose-500 border border-rose-100">🔒 {myUnopened.length} hộp đang chờ</span>
          <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-full text-amber-500 border border-amber-100">✨ {opens} lượt mở</span>
        </div>
        <button onClick={openBox} className="bg-rose-400 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-full shadow-sm text-sm">
          Mở hộp quà ngay
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-sm font-extrabold text-gray-700 mb-2">🤫 Thêm phần thưởng bí mật cho {nameOf(data, other)}</div>
        <div className="text-xs font-bold text-gray-400 mb-1.5">Chọn nhanh từ gợi ý</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESET_GIFTS.map((g) => (
            <button key={g.text} onClick={() => addGift(g)} className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              + {g.text}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hoặc viết quà riêng của bạn..."
          rows={2}
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
        />
        <button
          onClick={() => {
            if (!text.trim()) return;
            addGift({ text: text.trim() });
            setText("");
          }}
          className="w-full bg-violet-400 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm"
        >
          <Plus size={16} /> Bỏ vào hộp quà
        </button>

        {iAdded.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {iAdded.map((g) => (
              <div key={g.id} className="flex items-center justify-between text-xs bg-violet-50 rounded-lg px-2.5 py-1.5">
                <span className={`text-gray-600 ${g.opened ? "line-through opacity-50" : ""}`}>{g.text}</span>
                {!g.opened ? (
                  <button onClick={() => removeGift(g.id)} className="text-gray-300 hover:text-rose-400 ml-2">
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <span className="text-emerald-500 font-bold ml-2">đã mở 🎉</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {myOpened.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">Quà bạn đã mở</div>
          <div className="space-y-1.5">
            {myOpened.map((g) => (
              <div key={g.id} className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-sm text-gray-600">
                🎉 {g.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GiftRevealModal({ reveal, onClose }) {
  if (!reveal) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl gift-pop" onClick={(e) => e.stopPropagation()}>
        {reveal.kind === "gift" && (
          <>
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-xs font-bold text-rose-400 uppercase mb-1">Quà bí mật của bạn</div>
            <div className="text-lg font-extrabold text-gray-700 mb-4" style={{ fontFamily: DISPLAY_FONT }}>
              {reveal.text}
            </div>
          </>
        )}
        {reveal.kind === "empty" && (
          <>
            <div className="text-5xl mb-3">💌</div>
            <div className="font-bold text-gray-600 mb-4">
              Bạn đã có lượt mở, nhưng tình yêu của bạn chưa bỏ quà bí mật vào hộp. Gửi nụ hôn đến người ấy để nhắc họ thêm vào nhé!
            </div>
          </>
        )}
        {reveal.kind === "locked" && (
          <>
            <div className="mb-3 flex items-center justify-center">
              <Lock size={44} className="text-gray-300" />
            </div>
            <div className="font-bold text-gray-600 mb-4">Bạn cần thêm điểm để mở hộp tiếp theo. Hoàn thành các mục tiêu và thử thách hôm nay nhé! 💪</div>
          </>
        )}
        <button onClick={onClose} className="bg-rose-400 hover:bg-rose-500 text-white font-bold px-6 py-2 rounded-full text-sm">
          Đóng
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Finance tab                                                            */
/* ---------------------------------------------------------------------- */

function FinanceTab({ data, setData, activeProfile }) {
  const active = activeProfile;
  const dk = todayKey();
  const [type, setType] = useState("chi");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [period, setPeriod] = useState("day");

  const addExpense = () => {
    if (!amount || Number(amount) <= 0 || !label.trim()) return;
    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { id: uid(), profileId: active, dateKey: dk, type, amount: Number(amount), label: label.trim(), category }],
    }));
    setAmount("");
    setLabel("");
  };

  const removeExpense = (id) => setData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));

  const range = period === "day" ? [dk] : period === "week" ? lastNDays(7) : lastNDays(30);
  const inRange = (e) => range.includes(e.dateKey);

  const sumFor = (pid, t) => data.expenses.filter((e) => e.profileId === pid && e.type === t && inRange(e)).reduce((a, e) => a + e.amount, 0);

  const chiP1 = sumFor("p1", "chi");
  const chiP2 = sumFor("p2", "chi");
  const thuP1 = sumFor("p1", "thu");
  const thuP2 = sumFor("p2", "thu");
  const maxChi = Math.max(chiP1, chiP2, 1);
  const maxThu = Math.max(thuP1, thuP2, 1);

  const myExpensesInRange = data.expenses.filter((e) => e.profileId === active && e.type === "chi" && inRange(e));
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    category: c,
    total: myExpensesInRange.filter((e) => e.category === c).reduce((a, e) => a + e.amount, 0),
  })).filter((c) => c.total > 0);
  const maxCat = Math.max(...byCategory.map((c) => c.total), 1);

  const todayList = data.expenses.filter((e) => e.dateKey === dk).slice().reverse();

  return (
    <div className="px-4 py-4 space-y-5 pb-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-sm font-extrabold text-gray-700 mb-3">💰 Thêm khoản thu chi</div>
        <div className="flex gap-2 mb-2 bg-gray-100 rounded-full p-1">
          <button onClick={() => setType("chi")} className={`flex-1 text-xs font-bold py-1.5 rounded-full ${type === "chi" ? "bg-white text-rose-500 shadow-sm" : "text-gray-400"}`}>
            Khoản chi
          </button>
          <button onClick={() => setType("thu")} className={`flex-1 text-xs font-bold py-1.5 rounded-full ${type === "thu" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}>
            Khoản thu
          </button>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Số tiền (VND)"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-gray-200 px-2 py-2 text-xs font-bold">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Tên / mục đích, VD: Cà phê sáng"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-3"
        />
        <button onClick={addExpense} className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5">
          <Plus size={16} /> Thêm khoản
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-extrabold text-gray-700">So sánh chi tiêu</div>
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            {[
              ["day", "Ngày"],
              ["week", "Tuần"],
              ["month", "Tháng"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setPeriod(id)} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${period === id ? "bg-white text-rose-500 shadow-sm" : "text-gray-400"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] font-bold text-gray-400 uppercase mb-1.5">Tổng chi</div>
        {["p1", "p2"].map((pid) => (
          <div key={pid} className="flex items-center gap-2 mb-2">
            <span className="text-sm w-7">{data.profiles[pid].emoji}</span>
            <div className="flex-1 h-6 rounded-full bg-gray-50 overflow-hidden">
              <div className={`h-full rounded-full ${COLORS[pid].solid}`} style={{ width: `${(sumFor(pid, "chi") / maxChi) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-600 w-20 text-right">{formatVND(sumFor(pid, "chi"))}</span>
          </div>
        ))}

        <div className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 mt-3">Tổng thu</div>
        {["p1", "p2"].map((pid) => (
          <div key={pid} className="flex items-center gap-2 mb-2">
            <span className="text-sm w-7">{data.profiles[pid].emoji}</span>
            <div className="flex-1 h-6 rounded-full bg-gray-50 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-300" style={{ width: `${(sumFor(pid, "thu") / maxThu) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-600 w-20 text-right">{formatVND(sumFor(pid, "thu"))}</span>
          </div>
        ))}
      </div>

      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="text-sm font-extrabold text-gray-700 mb-3">Chi tiêu của bạn theo danh mục</div>
          {byCategory.map((c) => (
            <div key={c.category} className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-500 w-20">{c.category}</span>
              <div className="flex-1 h-5 rounded-full bg-gray-50 overflow-hidden">
                <div className={`h-full rounded-full ${COLORS[active].solid}`} style={{ width: `${(c.total / maxCat) * 100}%` }} />
              </div>
              <span className="text-[11px] font-bold text-gray-500 w-16 text-right">{formatVND(c.total)}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">Hôm nay</div>
        {todayList.length === 0 && <div className="text-sm text-gray-400 px-1">Chưa có khoản nào hôm nay 🌤️</div>}
        <div className="space-y-1.5">
          {todayList.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${COLORS[e.profileId].chip}`}>{data.profiles[e.profileId].emoji}</span>
                <div>
                  <div className="text-sm font-bold text-gray-700">{e.label}</div>
                  <div className="text-[11px] text-gray-400">{e.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${e.type === "chi" ? "text-rose-500" : "text-emerald-500"}`}>
                  {e.type === "chi" ? "-" : "+"}
                  {formatVND(e.amount)}
                </span>
                <button onClick={() => removeExpense(e.id)} className="text-gray-300 hover:text-rose-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Settings modal                                                          */
/* ---------------------------------------------------------------------- */

function SettingsModal({ data, setData, coupleId, onClose, onLogout, notifPermission, onRequestNotif }) {
  const [p1Name, setP1Name] = useState(data.profiles.p1.name);
  const [p2Name, setP2Name] = useState(data.profiles.p2.name);
  const [p1Flower, setP1Flower] = useState(data.profiles.p1.flower);
  const [p2Flower, setP2Flower] = useState(data.profiles.p2.flower);
  const [targets, setTargets] = useState(structuredClone(data.targets));
  const [urgencyLevels, setUrgencyLevels] = useState([...data.urgencyLevels]);
  const [newUrgency, setNewUrgency] = useState("");

  const save = () => {
    setData((prev) => ({
      ...prev,
      profiles: {
        p1: { ...prev.profiles.p1, name: p1Name.trim() || prev.profiles.p1.name, flower: p1Flower },
        p2: { ...prev.profiles.p2, name: p2Name.trim() || prev.profiles.p2.name, flower: p2Flower },
      },
      targets,
      urgencyLevels,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-extrabold text-gray-700 text-lg" style={{ fontFamily: DISPLAY_FONT }}>
            Cài đặt
          </div>
          <button onClick={onClose} className="text-gray-400 p-1">
            <X size={22} />
          </button>
        </div>

        {["p1", "p2"].map((pid) => (
          <div key={pid} className="mb-4 bg-gray-50 rounded-2xl p-3">
            <label className={`text-xs font-bold uppercase ${pid === "p1" ? "text-orange-500" : "text-violet-500"}`}>
              Tên của {data.profiles[pid].emoji}
            </label>
            <input
              value={pid === "p1" ? p1Name : p2Name}
              onChange={(e) => (pid === "p1" ? setP1Name(e.target.value) : setP2Name(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mt-1 mb-2"
            />
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Hoa yêu thích</div>
            <div className="flex flex-wrap gap-1.5">
              {FLOWERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => (pid === "p1" ? setP1Flower(f.id) : setP2Flower(f.id))}
                  className={`text-sm px-2 py-1 rounded-full border ${
                    (pid === "p1" ? p1Flower : p2Flower) === f.id ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                >
                  {f.emoji}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-gray-400 mt-2">Đăng nhập bằng: {data.profiles[pid].login || "(chưa có)"}</div>
          </div>
        ))}

        {["p1", "p2"].map((pid) => (
          <div key={pid} className="mb-4">
            <div className={`text-xs font-bold uppercase mb-2 ${pid === "p1" ? "text-orange-500" : "text-violet-500"}`}>
              Mục tiêu của {data.profiles[pid].name}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getTasksForProfile(data, pid)
                .filter((t) => !t.isMeals)
                .map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5">
                    <span>{t.emoji}</span>
                    <input
                      type="number"
                      value={targets[pid][t.id] ?? t.defaultTarget}
                      onChange={(e) =>
                        setTargets((prev) => ({ ...prev, [pid]: { ...prev[pid], [t.id]: Number(e.target.value) || 0 } }))
                      }
                      className="w-12 bg-transparent text-sm font-bold text-center focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400">{t.unit}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Thang mức độ ưu tiên nhiệm vụ</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {urgencyLevels.map((u) => (
              <span key={u} className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 flex items-center gap-1">
                {u}
                <button onClick={() => setUrgencyLevels((prev) => prev.filter((x) => x !== u))} className="text-gray-300 hover:text-rose-400">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newUrgency}
              onChange={(e) => setNewUrgency(e.target.value)}
              placeholder="Thêm mức độ mới, VD: Cuối tuần này 🗓️"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs"
            />
            <button
              onClick={() => {
                if (!newUrgency.trim()) return;
                setUrgencyLevels((prev) => [...prev, newUrgency.trim()]);
                setNewUrgency("");
              }}
              className="px-3 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold"
            >
              Thêm
            </button>
          </div>
        </div>

        <div className="mb-5">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Mã phòng của hai bạn</div>
          <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
            <span className="text-lg font-extrabold tracking-[0.25em] text-rose-500" style={{ fontFamily: DISPLAY_FONT }}>
              {coupleId}
            </span>
            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(coupleId);
                } catch {
                  // clipboard not available; ignore
                }
              }}
              className="text-xs font-bold text-rose-400 flex items-center gap-1"
            >
              <Copy size={13} /> Sao chép
            </button>
          </div>
        </div>

        <div className="mb-5">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Thông báo trên thiết bị</div>
          <button
            onClick={onRequestNotif}
            className="w-full bg-sky-50 text-sky-600 border border-sky-200 font-bold py-2.5 rounded-xl text-sm"
          >
            {notifPermission === "granted" ? "Đã bật thông báo trình duyệt ✓" : "Thử bật thông báo trình duyệt"}
          </button>
          <p className="text-[11px] text-gray-400 mt-1.5">* Cần cho phép quyền thông báo của trình duyệt; có thể không khả dụng trên mọi thiết bị.</p>
        </div>

        <button onClick={save} className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-3 rounded-2xl mb-2">
          Lưu thay đổi
        </button>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-1.5 text-gray-400 font-bold py-2 text-sm">
          <LogOut size={15} /> Rời khỏi thiết bị này
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Root App                                                                */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [coupleId, setCoupleId] = useState(() => loadSession()?.coupleId || null);
  const [activeProfile, setActiveProfile] = useState(() => loadSession()?.profileId || null);
  const [data, setDataRaw] = useState(null);
  const [connecting, setConnecting] = useState(!!loadSession());
  const [screen, setScreen] = useState("welcome"); // welcome | create | join | reveal
  const [revealCode, setRevealCode] = useState(null);

  const [tab, setTab] = useState("today");
  const [showSettings, setShowSettings] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const writeTimer = useRef(null);

  // Subscribe to the couple's data in Firebase Realtime Database whenever we have a coupleId.
  // Every update from either device (including our own writes) flows back through here,
  // which is what gives the realtime "no refresh needed" sync.
  useEffect(() => {
    if (!coupleId) return;
    setConnecting(true);
    const unsubscribe = subscribeCouple(coupleId, (val) => {
      setDataRaw(val);
      setConnecting(false);
    });
    return unsubscribe;
  }, [coupleId]);

  // Wrapped setter: updates local state immediately (snappy UI), then pushes the
  // full couple document to Firebase after a short debounce so rapid edits
  // (typing, +/- taps) don't fire a write per keystroke.
  const setData = (updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (coupleId) {
        if (writeTimer.current) clearTimeout(writeTimer.current);
        writeTimer.current = setTimeout(() => {
          saveCoupleData(coupleId, next).catch(() => {
            // network hiccup; local state still holds the change, next edit will retry the write
          });
        }, 250);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), 3000);
    return () => clearTimeout(t);
  }, [celebration]);

  const celebrate = (flowerEmoji) => setCelebration(makeCelebration(flowerEmoji));

  const requestNotif = async () => {
    try {
      if (typeof Notification === "undefined") return;
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    } catch {
      setNotifPermission("unsupported");
    }
  };

  const handleLoggedIntoRoom = (code, profileId) => {
    saveSession(code, profileId);
    setCoupleId(code);
    setActiveProfile(profileId);
  };

  const handleLogout = () => {
    clearSession();
    setShowSettings(false);
    setCoupleId(null);
    setActiveProfile(null);
    setDataRaw(null);
    setScreen("welcome");
  };

  // No paired room yet on this device — show the welcome / create / join flow.
  if (!coupleId) {
    if (screen === "create") {
      return (
        <CreateRoomScreen
          onBack={() => setScreen("welcome")}
          onCreated={(code) => {
            setRevealCode(code);
            setScreen("reveal");
          }}
        />
      );
    }
    if (screen === "reveal") {
      return (
        <RoomCodeReveal
          code={revealCode}
          onContinue={() => handleLoggedIntoRoom(revealCode, "p1")}
        />
      );
    }
    if (screen === "join") {
      return (
        <JoinRoomScreen
          onBack={() => setScreen("welcome")}
          onJoined={(code) => handleLoggedIntoRoom(code, "p2")}
        />
      );
    }
    return <WelcomeScreen onPickCreate={() => setScreen("create")} onPickJoin={() => setScreen("join")} />;
  }

  // Paired, but still waiting on the first snapshot from Firebase.
  if (connecting || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 gap-2">
        <div className="text-3xl animate-pulse">💞</div>
        <div className="text-xs font-bold text-gray-400">Đang kết nối với phòng của hai bạn...</div>
      </div>
    );
  }

  const dk = todayKey();
  const pendingCount = data.assignedTasks.filter((a) => a.dateKey === dk && a.assignedTo === activeProfile && a.status === "pending").length;
  const alertCount = computeAlerts(data).filter((a) => a.profileId !== activeProfile).length;

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col" style={{ fontFamily: BODY_FONT }}>
      <style>{`
        ${FONT_IMPORT}
        @keyframes giftPop {
          0% { transform: scale(0.7) rotate(-3deg); opacity: 0; }
          60% { transform: scale(1.05) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .gift-pop { animation: giftPop 0.35s ease-out; }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
       @keyframes floatUp {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-65vh) scale(1.1); opacity: 0; }
}
@keyframes bloomPop {
  0% { transform: translate(-50%,-50%) scale(0); opacity: 0; }
  50% { transform: translate(-50%,-50%) scale(1.3); opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
}
@keyframes burstOut {
  0% { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(-50%,-50%) translate(var(--dx), var(--dy)) scale(0.4); opacity: 0; }
}
@keyframes twinkle {
  0% { transform: scale(0.4); opacity: 0; }
  30% { transform: scale(1.2); opacity: 1; }
  60% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(0.3); opacity: 0; }
}
@keyframes flutter {

  0% { transform: translate(-8vw, 0) rotate(-8deg); opacity: 0; }
  10% { opacity: 1; }
  25% { transform: translate(28vw, -6vh) rotate(8deg); }
  50% { transform: translate(56vw, 4vh) rotate(-8deg); }
  75% { transform: translate(84vw, -8vh) rotate(8deg); }
  100% { transform: translate(108vw, 0) rotate(0deg); opacity: 0; }
}
  @keyframes catRun {
  0% { left: -10%; transform: scaleX(1); opacity: 0; }
  8% { opacity: 1; }
  40% { left: 38%; transform: scaleX(1); }
  50% { left: 38%; transform: scaleX(-1); }
  92% { opacity: 1; }
  100% { left: -10%; transform: scaleX(-1); opacity: 0; }
}
@keyframes bunnyHop {
  0% { left: -10%; transform: translateY(0); opacity: 0; }
  6% { opacity: 1; }
  20% { transform: translateY(-14px); }
  30% { transform: translateY(0); }
  45% { transform: translateY(-14px); }
  55% { transform: translateY(0); }
  94% { opacity: 1; }
  100% { left: 105%; opacity: 0; }
}
@keyframes kissWave {
  0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
  20% { transform: scale(1.1) rotate(-8deg); opacity: 1; }
  35% { transform: scale(1) rotate(8deg); }
  50% { transform: scale(1.1) rotate(-8deg); }
  65% { transform: scale(1) rotate(8deg); }
  100% { transform: scale(0.7) rotate(0deg); opacity: 0; }
}
@keyframes pawPrint {
  0% { opacity: 0; transform: scale(0.6); }
  40% { opacity: 0.55; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}
      `}</style>

      <Header data={data} activeProfile={activeProfile} onOpenSettings={() => setShowSettings(true)} onOpenAlerts={() => setShowAlerts(true)} alertCount={alertCount} />

      <div className="flex-1 overflow-y-auto">
        {tab === "today" && <TodayTab data={data} setData={setData} activeProfile={activeProfile} coupleId={coupleId} onCelebrate={celebrate} />}
        {tab === "tasks" && <TasksTab data={data} setData={setData} activeProfile={activeProfile} onCelebrate={celebrate} />}
        {tab === "mood" && <MoodTab data={data} setData={setData} activeProfile={activeProfile} />}
        {tab === "gift" && <GiftTab data={data} setData={setData} activeProfile={activeProfile} onReveal={setReveal} />}
        {tab === "finance" && <FinanceTab data={data} setData={setData} activeProfile={activeProfile} />}
      </div>

      <BottomNav tab={tab} setTab={setTab} pendingCount={pendingCount} />

      {showSettings && (
        <SettingsModal
          data={data}
          setData={setData}
          coupleId={coupleId}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
          notifPermission={notifPermission}
          onRequestNotif={requestNotif}
        />
      )}
      {showAlerts && <AlertsPanel data={data} setData={setData} activeProfile={activeProfile} onClose={() => setShowAlerts(false)} />}
      {reveal && <GiftRevealModal reveal={reveal} onClose={() => setReveal(null)} />}
      <CelebrationOverlay celebration={celebration} />
      <AmbientCritters />
    </div>
  );
}