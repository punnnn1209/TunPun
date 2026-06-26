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
const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@400;500;600;700;800&display=swap');";
const DISPLAY_FONT = "'Baloo 2', system-ui, sans-serif";
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

const GENDERS = [
  { id: "nam", emoji: "🤵", label: "Nam" },
  { id: "nu", emoji: "👰", label: "Nữ" },
  { id: "khac", emoji: "🌈", label: "Khác / Không nói" },
];

const ROLE_TITLES = [
  "Người giữ trái tim em 🔐",
  "Một nửa của anh 💑",
  "Gấu bông biết đi 🧸",
  "Boss khó tính dễ thương 😎",
  "Đầu bếp riêng 🍳",
  "Vệ sĩ 24/7 🛡️",
  "Người gọi dậy mỗi sáng ☀️",
  "Bạn đời tương lai 💍",
  "Trùm cuối của tim em 👑",
  "Người chữa lành mọi mệt mỏi 🩹",
  "Đồng phạm ăn vặt 🍟",
  "Crush không đối thủ 😍",
  "Wifi của đời em (không có là khó sống) 📶",
  "Vitamin tinh thần mỗi ngày 💊",
  "CEO của trái tim anh 💼",
];

const TASKS = [
  { id: "water", emoji: "💧", name: "Uống nước", unit: "cốc", step: 1, defaultTarget: 8, theme: "water" },
  { id: "move", emoji: "🚶‍♀️", name: "Đi bộ / Chạy", unit: "km", step: 0.5, defaultTarget: 3, theme: "move" },
  { id: "read", emoji: "📖", name: "Đọc sách", unit: "trang", step: 5, defaultTarget: 15, theme: "read" },
  {
    id: "vocab",
    emoji: "🔤",
    name: "Từ vựng mới",
    unit: "từ",
    step: 1,
    defaultTarget: 5,
    hasNote: true,
    notePlaceholder: "Ghi các từ đã học, cách nhau bằng dấu phẩy...",
    theme: "vocab",
  },
  { id: "meals", emoji: "🍱", name: "Ăn đủ bữa", unit: "bữa", step: 1, defaultTarget: 3, isMeals: true, theme: "meals" },
  {
    id: "screentime",
    emoji: "📱",
    name: "Giới hạn thời gian sử dụng màn hình",
    unit: "phút",
    step: 10,
    defaultTarget: 90,
    inverse: true,
    hint: "Mục tiêu này nên để người ấy đặt cho bạn nhé",
    theme: "screentime",
  },
];
const MEAL_LABELS = ["Sáng", "Trưa", "Tối"];

// Paraphrased, in my own words, from general hydration-timing guidance (not copied verbatim from any single source).
const WATER_REMINDER_TIMES = [
  { time: "06:30", tip: "Một cốc nước ngay khi vừa ngủ dậy giúp cơ thể tỉnh táo lại sau một đêm dài." },
  { time: "08:30", tip: "Sau bữa sáng, uống thêm nước giúp hệ tiêu hoá làm việc trơn tru hơn." },
  { time: "11:30", tip: "Giữa buổi sáng là lúc da dễ khô nhất, làm một cốc cho mọng nước nào." },
  { time: "13:30", tip: "Sau giấc nghỉ trưa, một cốc nước giúp đầu óc tỉnh táo trở lại." },
  { time: "15:30", tip: "Giữa chiều dễ buồn ngủ — uống nước thay vì cà phê cũng giúp tập trung hơn." },
  { time: "17:00", tip: "Trước khi rời chỗ làm/học, bổ sung nước để không thấy đuối vào cuối ngày." },
  { time: "19:30", tip: "Buổi tối là lúc cơ thể cần thanh lọc — đừng quên cốc nước này." },
  { time: "21:30", tip: "Một cốc nhỏ trước khi ngủ — nhưng đừng uống quá nhiều để khỏi mất ngủ giữa đêm." },
];

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
const LOW_MOODS = ["met", "chan", "stress"];

const WEATHERS = [
  { id: "nang", emoji: "☀️", label: "Nắng đẹp" },
  { id: "oi", emoji: "🥵", label: "Oi nóng" },
  { id: "mat", emoji: "⛅", label: "Mát mẻ" },
  { id: "mua", emoji: "🌧️", label: "Mưa" },
  { id: "lanh", emoji: "❄️", label: "Lạnh" },
  { id: "gio", emoji: "🌬️", label: "Gió nhiều" },
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

/* Encouragement message pools — personal, lighthearted customization for a couple's own app.
   Both directions are written warm and not one-sided: she cheers him on with big energy,
   he reassures her gently; same idea mirrored for low-mood comforting. Neutral pools cover
   "Khác / Không nói" or when only one partner's gender is set. {name} is replaced with the
   partner's nickname/role title if they set one, otherwise their first name. */
const CHEER_FOR_HIM = [
  "Người yêu của em siêu quáaaaa!!! 😍💪",
  "Anh yêu đỉnh nhất luôn á 🥹💖",
  "Sao có người vừa chăm vừa ngầu vậy nhỉ 😎✨",
  "Em tự hào về anh quá đi mất 🥰🏆",
  "Đúng là không có đối thủ thật mà 😤💕",
  "Anh làm em tin vào những điều tốt đẹp ghê 🌟",
  "Cố lên là thấy ngay, mê anh hơn mỗi ngày 💘",
  "Người yêu em chăm chỉ thế này thì ai mà không yêu 🫠",
  "Một tràng pháo tay cho anh nè 👏👏👏 quá đỉnh!!!",
  "Em xin một chữ ký của thần tượng được không ạ 😆💗",
  "Lại thêm một lý do để em yêu anh nhiều hơn rồi đó 💞",
];
const CHEER_FOR_HER = [
  "{name} của anh giỏi quá, anh tự hào lắm 🥹💪",
  "Cố lên {name}, anh luôn đứng sau cổ vũ em nè 📣💕",
  "{name} làm được rồi đó, đúng là không có gì cản được em 🌟",
  "Anh thấy em xinh nhất lúc đang cố gắng như này 🥰",
  "{name} ơi, hôm nay em ngầu cực kỳ luôn á 🔥",
  "Chậm một chút cũng không sao, anh vẫn ở đây cổ vũ em 🫶",
  "Em là động lực để anh cũng phải cố gắng hơn mỗi ngày 💖",
  "{name} của anh hôm nay toả sáng quá trời 🌈",
  "Anh tin em làm được, vì em chưa từng làm anh thất vọng 🥹",
  "Cứ từng bước nhỏ thôi, anh sẽ đi cùng em 👣💞",
];
const COMFORT_FOR_HER = [
  "Em bé của anh cố lên nha, anh yêu em 🥺💕",
  "{name} ơi đừng buồn, có anh ở đây rồi 🫂💗",
  "Hôm nay mệt thì nghỉ chút cũng được, anh không trách đâu 🤗",
  "Em không cần phải mạnh mẽ suốt đâu, dựa vào anh đi 🥹",
  "Anh gửi một cái ôm thật chặt cho {name} nè 🫶",
  "Buồn xíu rồi sẽ qua thôi, anh ở ngay đây mà 💌",
  "{name} là ưu tiên số một của anh, nghỉ ngơi đi rồi mình nói chuyện 💗",
  "Anh không sửa được hết mọi thứ, nhưng anh có thể ôm em lâu hơn 🩹",
  "Cố lên xíu nữa thôi {name}, có anh đồng hành rồi 🌙",
];
const COMFORT_FOR_HIM = [
  "Anh ơi đừng cố gắng một mình, có em ở đây rồi 🥺💕",
  "{name} mệt thì nghỉ chút nha, em vẫn thương anh như vậy 🫂",
  "Em biết hôm nay khó khăn, nhưng anh không cô đơn đâu 💗",
  "Cho phép mình yếu lòng một chút cũng được mà {name} 🤍",
  "Em gửi một cái ôm thật chặt cho {name} đây 🫶",
  "Mai sẽ ổn hơn thôi, hôm nay cứ dựa vào em một chút 🌙",
  "{name} luôn mạnh mẽ vì hai đứa rồi, hôm nay để em mạnh mẽ thay anh 💪💕",
  "Có chuyện gì thì kể em nghe, em luôn ở đây 💌",
];
const NEUTRAL_CHEER = [
  "Giỏi quá đi, {name} ơi! 🎉",
  "{name} làm được rồi, tự hào về bạn lắm 🥳",
  "Cố gắng này xứng đáng được khen thật to 👏",
  "{name} đang toả sáng theo cách riêng của mình ✨",
  "Một bước tiến nhỏ hôm nay, một phiên bản tốt hơn của {name} 🌱",
];
const NEUTRAL_COMFORT = [
  "{name} ơi, hôm nay mệt thì nghỉ ngơi một chút nhé 🤍",
  "Không sao đâu {name}, ngày mai sẽ nhẹ nhàng hơn 🌙",
  "{name} không cần ổn mọi lúc, mình luôn ở đây 🫂",
  "Cho phép bản thân chậm lại một chút cũng được {name} 💗",
];

function pickEncouragement(pool, name) {
  const msg = pool[Math.floor(Math.random() * pool.length)];
  return msg.replace("{name}", name || "bạn");
}

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
      p2: { name: "", emoji: "", flower: "", login: "", gender: "", roleTitle: "" },
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

// Firebase Realtime Database silently deletes any key whose value is an empty
// array/object when written — so "assignedTasks: []" on day one comes back as
// "assignedTasks: undefined" on the next read. Every place in this app that
// does data.someList.filter(...)/.map(...) would then crash the whole render
// (blank white screen, no error boundary catches it fast enough to feel safe).
// This runs once, right when data arrives from Firebase, so everything downstream
// can keep assuming these fields always exist.
function normalizeCoupleData(raw) {
  const safe = raw || {};
  const p1 = safe.profiles?.p1 || {};
  const p2 = safe.profiles?.p2 || {};
  return {
    ...safe,
    profiles: {
      p1: { name: "", emoji: "", flower: "", login: "", gender: "", roleTitle: "", ...p1 },
      p2: { name: "", emoji: "", flower: "", login: "", gender: "", roleTitle: "", ...p2 },
    },
    targets: {
      p1: { water: 8, move: 3, read: 15, vocab: 5, meals: 3, screentime: 90, ...(safe.targets?.p1 || {}) },
      p2: { water: 8, move: 3, read: 15, vocab: 5, meals: 3, screentime: 90, ...(safe.targets?.p2 || {}) },
    },
    customHabits: { p1: safe.customHabits?.p1 || [], p2: safe.customHabits?.p2 || [] },
    dailyData: safe.dailyData || {},
    assignedTasks: safe.assignedTasks || [],
    sharedTasks: safe.sharedTasks || [],
    moods: safe.moods || {},
    gifts: safe.gifts || [],
    bonusTickets: { p1: safe.bonusTickets?.p1 || 0, p2: safe.bonusTickets?.p2 || 0 },
    expenses: safe.expenses || [],
    urgencyLevels: safe.urgencyLevels && Object.keys(safe.urgencyLevels).length ? safe.urgencyLevels : [...DEFAULT_URGENCY_LEVELS],
    dismissedAlerts: safe.dismissedAlerts || [],
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

// Assigned ("thử thách") tasks now use the same verified, counter-based completion as habits
// instead of a self-declared rating — ratio/tickets are always computed live from value/target.
function assignedRatio(task) {
  if (!task.target || task.target <= 0) return task.value > 0 ? 1 : 0;
  return (task.value || 0) / task.target;
}
function assignedTickets(task) {
  const ratio = assignedRatio(task);
  const tierTickets = getLevel(ratio).tickets; // 0-3
  return Math.round((task.ticketValue || 5) * (tierTickets / 3));
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
    .filter((a) => a.dateKey === dateKey && a.assignedTo === pid)
    .forEach((a) => (total += assignedTickets(a)));
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
    const profile = data.profiles[pid];
    if (!profile?.name) return;
    if (!profile.createdAt || profile.createdAt > offsetDateKey(3)) return;
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

// Per-task-type "hero" visual — keeps each habit from feeling like the same generic counter.
function getTaskVisual(task, ratio, flowerEmoji) {
  const theme = task.theme;
  if (theme === "water") {
    if (ratio <= 0) return { emoji: "🪴", label: "Chưa tưới nước hôm nay" };
    if (ratio < 0.5) return { emoji: "🌱", label: "Mầm non đang lớn" };
    if (ratio < 1) return { emoji: "🌿", label: "Xanh tốt rồi đó" };
    if (ratio < 1.2) return { emoji: flowerEmoji || "🌸", label: "Nở hoa rồi, tuyệt vời!" };
    return { emoji: (flowerEmoji || "🌸") + "✨", label: "Hoa nở rộ, toả hương!" };
  }
  if (theme === "move") {
    if (ratio <= 0) return { emoji: "🧍", label: "Chưa bắt đầu" };
    if (ratio < 0.4) return { emoji: "🚶", label: "Đang dạo bước" };
    if (ratio < 0.8) return { emoji: "🏃", label: "Tăng tốc nào" };
    if (ratio < 1.2) return { emoji: "💪", label: "Cơ bắp cuồn cuộn" };
    return { emoji: "🏆", label: "Vận động viên thực thụ" };
  }
  if (theme === "read") {
    if (ratio <= 0) return { emoji: "📖", label: "Chưa mở sách" };
    if (ratio < 0.5) return { emoji: "📖", label: "Đang lật từng trang" };
    if (ratio < 1) return { emoji: "📚", label: "Sắp xong rồi" };
    if (ratio < 1.2) return { emoji: "🤓", label: "Mọt sách chính hiệu" };
    return { emoji: "🎓", label: "Kiến thức đầy ắp" };
  }
  if (theme === "vocab") {
    if (ratio <= 0) return { emoji: "🔤", label: "Chưa học từ nào" };
    if (ratio < 0.5) return { emoji: "🧠", label: "Não đang nạp dữ liệu" };
    if (ratio < 1) return { emoji: "🧠", label: "Từ vựng đang đầy lên" };
    if (ratio < 1.2) return { emoji: "🎓", label: "Giỏi quá đi!" };
    return { emoji: "🌟", label: "Sắp thành chuyên gia rồi" };
  }
  if (theme === "screentime") {
    if (ratio >= 1.2) return { emoji: "🧘", label: "Bình yên tuyệt đối" };
    if (ratio >= 1) return { emoji: "😌", label: "Kiểm soát tốt" };
    if (ratio >= 0.5) return { emoji: "📱", label: "Cẩn thận kẻo nghiện" };
    return { emoji: "🥴", label: "Dùng nhiều quá rồi!" };
  }
  return null;
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

// Progress box with the icon/plant AND the "x / y unit" label both inside the bar itself,
// so the visual (flower pot, hero emoji...) sits in the middle of the progress indicator
// instead of living in a separate row above it.
function ProgressBoxWithIcon({ ratio, colorClass, label, children }) {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  return (
    <div className="relative flex-1 h-20 rounded-2xl bg-gray-100 overflow-hidden">
      <div className={`absolute inset-y-0 left-0 rounded-2xl ${colorClass} transition-all duration-500 ease-out`} style={{ width: `${pct}%` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {children}
        <span className="text-xs font-extrabold text-gray-700 drop-shadow-sm">{label}</span>
      </div>
    </div>
  );
}

// A plant that grows continuously with every cup of water — sprout in a pot that gets
// taller and grows leaves bit by bit, instead of jumping between a few fixed emoji.
const PLANT_MAX_STEM = 52; // px, height at 100% progress
const PLANT_MIN_STEM = 6; // px, always-visible little sprout even at 0%
const PLANT_LEAF_CHECKPOINTS = [14, 27, 40]; // px of stem height at which each leaf pair appears

function GrowingPlant({ ratio, flowerEmoji, bump, compact }) {
  const cappedRatio = Math.min(1, Math.max(0, ratio));
  const stemHeight = PLANT_MIN_STEM + cappedRatio * (PLANT_MAX_STEM - PLANT_MIN_STEM);
  const bloomed = ratio >= 1;
  const flower = flowerEmoji || "🌸";

  const plant = (
    <div key={bump} className="relative w-14 h-24 shrink-0" style={{ animation: "plantWater 0.4s ease-out" }}>
      {/* pot */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-5 bg-orange-400 rounded-b-xl rounded-t-sm" />
      <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 w-10 h-1.5 bg-orange-500 rounded-full" />
      {/* stem */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-1 bg-emerald-500 rounded-full transition-all duration-500 ease-out"
        style={{ bottom: "20px", height: `${stemHeight}px` }}
      />
      {/* leaves, revealed one by one as the stem grows past each checkpoint */}
      {PLANT_LEAF_CHECKPOINTS.map((checkpoint, i) => (
        <span
          key={checkpoint}
          className="absolute text-sm transition-all duration-500 ease-out"
          style={{
            bottom: `${20 + checkpoint}px`,
            left: i % 2 === 0 ? "22%" : "60%",
            opacity: stemHeight >= checkpoint ? 1 : 0,
            transform: stemHeight >= checkpoint ? "scale(1)" : "scale(0)",
          }}
        >
          🍃
        </span>
      ))}
      {/* flower blooms once the day's target is fully met */}
      {bloomed && (
        <span
          className="absolute text-xl left-1/2"
          style={{ bottom: `${20 + stemHeight - 4}px`, transform: "translateX(-50%)", animation: "bloomPop 0.6s ease-out" }}
        >
          {ratio >= 1.2 ? `${flower}✨` : flower}
        </span>
      )}
    </div>
  );

  if (!compact) return plant;
  // Scaled-down wrapper so the same plant fits neatly inside the progress box.
  return (
    <div className="w-14 h-[60px] flex items-end justify-center overflow-visible">
      <div style={{ transform: "scale(0.62)", transformOrigin: "bottom center" }}>{plant}</div>
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
    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-base font-extrabold border border-amber-100" style={{ fontFamily: DISPLAY_FONT }}>
      <span>{flowerEmoji || "🌸"}</span> {count} phiếu
    </div>
  );

}

/* ---------------------------------------------------------------------- */
/* Encouragement toast — gender-flavoured cheer / comfort lines             */
/* ---------------------------------------------------------------------- */

function EncouragementToast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  const isComfort = toast.kind === "comfort";
  return (
    <div className="fixed top-3 inset-x-3 z-[55] flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-2xl shadow-lg border px-4 py-3 flex items-start gap-2.5 ${
          isComfort ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"
        }`}
        style={{ animation: "toastPop 0.4s ease-out" }}
      >
        <span className="text-2xl shrink-0">{isComfort ? "🥺" : "🎉"}</span>
        <div className="text-sm font-bold text-gray-700 leading-snug" style={{ fontFamily: BODY_FONT }}>
          {toast.text}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Celebration overlay — 12 effects, one picked at random each time        */
/* ---------------------------------------------------------------------- */

const CELEBRATION_PALETTE = ["bg-rose-300", "bg-amber-300", "bg-sky-300", "bg-violet-300", "bg-emerald-300", "bg-pink-300"];
const HEART_EMOJIS = ["💕", "💖", "💗", "❤️", "💞"];
const SHOWER_EMOJIS = ["🎉", "🎊", "✨", "🌟", "💫"];
const CELEBRATION_TYPES = [
  "confetti",
  "bloom",
  "kiss",
  "firework",
  "hearts",
  "sparkle",
  "rainbow",
  "balloon",
  "butterfly",
  "medal",
  "loveletter",
  "shower",
];

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
        pieces: Array.from({ length: 26 }, () => ({
          left: Math.random() * 100,
          size: `${6 + Math.random() * 9}px`,
          delay: Math.random() * 0.4,
          color: randomColor(),
        })),
      };
    case "bloom":
      return { centerEmoji: flower };
    case "kiss":
      return { items: floatItems(7, "💋") };
    case "firework":
      return { bursts: burstItems(20, 130) };
    case "hearts":
      return { items: floatItems(10, null, HEART_EMOJIS) };
    case "sparkle":
      return {
        stars: Array.from({ length: 18 }, () => ({
          left: Math.random() * 100,
          top: 8 + Math.random() * 78,
          delay: Math.random() * 1.2,
          size: 14 + Math.random() * 18,
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
    case "loveletter":
      return { centerEmoji: "💌", ring: burstItems(8, 95) };
    case "shower":
      return {
        pieces: Array.from({ length: 22 }, () => ({
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          emoji: SHOWER_EMOJIS[Math.floor(Math.random() * SHOWER_EMOJIS.length)],
        })),
      };
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

      {type === "shower" &&
        data.pieces.map((p, i) => (
          <span
            key={i}
            className="absolute text-2xl"
            style={{ left: `${p.left}%`, top: "-8%", animation: `confettiFall 2.8s ease-in ${p.delay}s forwards` }}
          >
            {p.emoji}
          </span>
        ))}

      {(type === "bloom" || type === "rainbow" || type === "medal" || type === "loveletter") && (
        <div className="absolute left-1/2 top-1/2 text-7xl" style={{ transform: "translate(-50%,-50%)", animation: "bloomPop 1.1s ease-out forwards" }}>
          {data.centerEmoji}
        </div>
      )}

      {(type === "medal" || type === "loveletter") &&
        data.ring.map((r, i) => (
          <span
            key={i}
            className="absolute text-xl left-1/2 top-1/2"
            style={{ "--dx": `${r.dx}px`, "--dy": `${r.dy}px`, animation: `burstOut 1.3s ease-out ${r.delay}s forwards` }}
          >
            {type === "loveletter" ? "💗" : "✨"}
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

/* ---------------------------------------------------------------------- */
/* Ambient critters — slow, wandering, mid-screen cute moments             */
/* ---------------------------------------------------------------------- */

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
        const top = 18 + Math.random() * 45; // wander somewhere in the middle of the screen, not glued to one edge
        setCritter({ key, type, top });
        setTimeout(() => setCritter(null), 13000);
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
        <span
          key={critter.key}
          className="absolute text-5xl"
          style={{ top: `${critter.top}vh`, animation: "catRun 12s ease-in-out forwards" }}
        >
          🐱
        </span>
      )}
      {critter.type === "bunny" && (
        <span
          key={critter.key}
          className="absolute text-5xl"
          style={{ top: `${critter.top}vh`, animation: "bunnyHop 10s ease-in-out forwards" }}
        >
          🐰
        </span>
      )}
      {critter.type === "kiss" && (
        <span key={critter.key} className="absolute text-4xl" style={{ top: `${critter.top}vh`, right: "8%", animation: "kissWave 3.6s ease-in-out forwards" }}>
          😘
        </span>
      )}
      {critter.type === "paw" && (
        <div key={critter.key} style={{ position: "absolute", top: `${critter.top}vh`, left: 0, right: 0 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-xl opacity-0"
              style={{ left: `${10 + i * 15}%`, animation: `pawPrint 0.6s ease-out ${i * 0.4}s forwards` }}
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
      <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-indigo-300 opacity-30 blur-3xl" />
      <div className="absolute top-1/3 -right-12 w-64 h-64 rounded-full bg-blue-300 opacity-30 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-sky-200 opacity-40 blur-3xl" />
      <div className="absolute bottom-10 right-0 w-40 h-40 rounded-full bg-cyan-100 opacity-50 blur-3xl" />
    </div>
  );
}

function ProfileSetupForm({ initial, accentText, accentBorder, accentRing, accentSolid, onSubmit, submitLabel }) {
  const [name, setName] = useState(initial?.name || "");
  const [emoji, setEmoji] = useState(initial?.emoji || PROFILE_EMOJI_CHOICES[0]);
  const [flower, setFlower] = useState(initial?.flower || FLOWERS[0].id);
  const [gender, setGender] = useState(initial?.gender || "");
  const [roleTitle, setRoleTitle] = useState(initial?.roleTitle || "");

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
      <label className={`text-xs font-bold uppercase ${accentText}`}>Tên của bạn</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="VD: Bống"
        className={`w-full mt-1 mb-3 rounded-xl border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 ${accentRing || "focus:ring-sky-200"}`}
        style={{ fontFamily: BODY_FONT }}
      />

      <div className="text-xs font-bold text-gray-400 uppercase mb-1.5">Giới tính</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {GENDERS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGender(g.id)}
            className={`flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full border-2 ${
              gender === g.id ? `${accentBorder} bg-gray-50` : "border-gray-200"
            }`}
          >
            <span>{g.emoji}</span>
            {g.label}
          </button>
        ))}
      </div>

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

      <div className="text-xs font-bold text-gray-400 uppercase mb-1.5">Bạn là gì của người kia? 😜</div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ROLE_TITLES.map((r) => (
          <button
            key={r}
            onClick={() => setRoleTitle(r)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-2 ${
              roleTitle === r ? `${accentBorder} bg-gray-50` : "border-gray-200 text-gray-500"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSubmit({ name: name.trim(), emoji, flower, gender, roleTitle })}
        disabled={!name.trim()}
        className={`w-full ${accentSolid || "bg-sky-400 hover:bg-sky-500"} disabled:opacity-40 text-white font-bold py-3 rounded-2xl shadow-sm transition-colors text-lg`}
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
            method === "gmail" ? "bg-sky-50 border-sky-300 text-sky-500" : "border-gray-200 text-gray-400"
          }`}
        >
          <Mail size={15} /> Gmail
        </button>
        <button
          onClick={() => setMethod("phone")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold border ${
            method === "phone" ? "bg-sky-50 border-sky-300 text-sky-500" : "border-gray-200 text-gray-400"
          }`}
        >
          <Phone size={15} /> Số điện thoại
        </button>
      </div>
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder={method === "gmail" ? "ten@gmail.com" : "09xxxxxxxx"}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
      <p className="text-[11px] text-gray-400 mt-1.5">* Chỉ để hiển thị trong hồ sơ, không dùng để đăng nhập — phòng của bạn được bảo vệ bằng mã kết nối riêng.</p>
    </div>
  );
}

function WelcomeScreen({ onPickCreate, onPickJoin }) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-blue-100 via-sky-50 to-white">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-5xl mb-3">💌</div>
        <h1 className="text-3xl font-extrabold text-blue-600 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          {APP_NAME}
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center max-w-xs">
          Mọi sự thay đổi đều khó khăn lúc ban đầu, lộn xộn ở giữa và tuyệt đẹp ở cuối 🎁
        </p>
        <button
          onClick={onPickCreate}
          className="w-full max-w-sm bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-2xl shadow-sm mb-3 flex items-center justify-center gap-2 text-lg"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          <Link2 size={18} /> Tạo phòng mới
        </button>
        <button
          onClick={onPickJoin}
          className="w-full max-w-sm bg-white border border-sky-200 text-sky-600 font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-lg"
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
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-blue-50 via-sky-50 to-white">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <button onClick={onBack} className="self-start mb-3 text-xs font-bold text-gray-400">
          ← Quay lại
        </button>
        <div className="text-4xl mb-2">🏡</div>
        <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          Tạo phòng của hai bạn
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Điền thông tin của bạn, app sẽ tạo một link riêng để người ấy bấm vào tham gia.</p>

        <ContactField method={method} setMethod={setMethod} contact={contact} setContact={setContact} />
        {error && <div className="text-xs text-rose-500 font-bold mb-2 text-center">{error}</div>}

        <ProfileSetupForm
          accentText="text-sky-600"
          accentBorder="border-sky-400"
          accentRing="focus:ring-sky-200"
          accentSolid="bg-sky-500 hover:bg-sky-600"
          submitLabel={creating ? "Đang tạo phòng..." : "Tạo phòng & tiếp tục 💞"}
          onSubmit={async ({ name, emoji, flower, gender, roleTitle }) => {
            if (creating) return;
            setCreating(true);
            setError("");
            try {
              const profile = { name, emoji, flower, gender, roleTitle, login: contact.trim().toLowerCase(), createdAt: todayKey() };
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const shareLink = (() => {
    try {
      return `${window.location.origin}${window.location.pathname}?join=${code}`;
    } catch {
      return code;
    }
  })();
  const copyLink = () => {
    try {
      navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      // clipboard not available; ignore
    }
  };
  const copyCode = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      // clipboard not available; ignore
    }
  };
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-blue-50 via-sky-50 to-white">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          Phòng của bạn đã sẵn sàng!
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Gửi link này cho người ấy — bấm vào là vào thẳng phòng luôn, không cần nhập gì thêm 💌</p>

        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-sky-100 p-5 text-center mb-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase mb-1.5">Link mời (cách nhanh nhất)</div>
          <div className="text-xs text-sky-700 font-bold bg-sky-50 rounded-xl p-3 mb-3 break-all">{shareLink}</div>
          <button onClick={copyLink} className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-full">
            <Copy size={13} /> {copiedLink ? "Đã sao chép link!" : "Sao chép link mời"}
          </button>

          <div className="text-[11px] text-gray-400 mt-4 mb-1">Hoặc đọc mã cho người ấy tự nhập:</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-extrabold tracking-[0.25em] text-gray-500" style={{ fontFamily: DISPLAY_FONT }}>
              {code}
            </span>
            <button onClick={copyCode} className="text-gray-400">
              <Copy size={14} />
            </button>
          </div>
          {copiedCode && <div className="text-[10px] text-emerald-500 font-bold mt-1">Đã sao chép mã!</div>}
        </div>

        <button
          onClick={onContinue}
          className="w-full max-w-sm bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-2xl shadow-sm text-lg"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          Vào app ngay 🚀
        </button>
      </div>
    </div>
  );
}

function JoinRoomScreen({ onBack, onJoined, initialCode }) {
  const [code, setCode] = useState(initialCode || "");
  const [checking, setChecking] = useState(false);
  const [validRoom, setValidRoom] = useState(null);
  const [fullRoom, setFullRoom] = useState(null); // { code, profiles } — room already has both people, let the rightful owner pick who they are
  const [error, setError] = useState("");
  const [method, setMethod] = useState("gmail");
  const [contact, setContact] = useState("");
  const [joining, setJoining] = useState(false);

  const checkCode = async (overrideVal) => {
    const val = (overrideVal ?? code).trim().toUpperCase();
    if (val.length < 4) return;
    setChecking(true);
    setError("");
    setFullRoom(null);
    try {
      const roomData = await getCoupleData(val);
      if (!roomData) {
        setError("Không tìm thấy phòng với mã này, kiểm tra lại nhé 💌");
      } else if (roomData.profiles?.p1?.name && roomData.profiles?.p2?.name) {
        // Both slots already taken. Instead of blocking, let whoever knows the code
        // pick which of the two people they are — this is also how re-installing the
        // app (e.g. "Add to Home Screen" on iOS keeps a separate, empty storage area
        // from regular Safari) gets back into an existing room on the same device.
        setFullRoom({ code: val, profiles: roomData.profiles });
      } else {
        setValidRoom(val);
      }
    } catch {
      setError("Không kiểm tra được mã, thử lại nhé.");
    } finally {
      setChecking(false);
    }
  };

  // Arrived via a one-tap invite link (?join=CODE) — skip straight to checking it.
  useEffect(() => {
    if (initialCode) checkCode(initialCode);
  }, []);

  if (fullRoom) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
        <BlobBackground />
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
            Phòng này đã có đủ hai người
          </h1>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
            Nếu đây là phòng của bạn (đổi máy, đổi trình duyệt, hoặc vừa cài app...), chọn đúng vai trò của mình để vào lại nhé.
          </p>

          <div className="w-full max-w-sm space-y-3 mb-4">
            {["p1", "p2"].map((pid) => {
              const p = fullRoom.profiles[pid];
              if (!p?.name) return null;
              return (
                <button
                  key={pid}
                  onClick={() => onJoined(fullRoom.code, pid)}
                  className="w-full bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-400 p-4 flex items-center gap-3 text-left shadow-sm"
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="font-bold text-gray-700">Tôi là {p.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setFullRoom(null);
              setCode("");
            }}
            className="text-xs font-bold text-gray-400 underline"
          >
            Không phải phòng của tôi, thử mã khác
          </button>
          <button onClick={onBack} className="mt-3 text-xs font-bold text-gray-400">
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (validRoom) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
        <BlobBackground />
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="text-4xl mb-2">👋</div>
          <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
            Chào người ấy!
          </h1>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Hoàn tất hồ sơ của bạn để bắt đầu cùng nhau trên {APP_NAME} 💞</p>

          <ContactField method={method} setMethod={setMethod} contact={contact} setContact={setContact} />

          <ProfileSetupForm
            accentText="text-indigo-500"
            accentBorder="border-indigo-400"
            accentRing="focus:ring-indigo-200"
            accentSolid="bg-indigo-500 hover:bg-indigo-600"
            submitLabel={joining ? "Đang tham gia..." : "Hoàn tất, vào app 🚀"}
            onSubmit={async ({ name, emoji, flower, gender, roleTitle }) => {
              if (joining) return;
              setJoining(true);
              try {
                const profile = { name, emoji, flower, gender, roleTitle, login: contact.trim().toLowerCase(), createdAt: todayKey() };
                await setCouplePath(validRoom, "profiles/p2", profile);
                onJoined(validRoom, "p2");
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
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
      <BlobBackground />
      <div className="relative z-10 flex flex-col items-center w-full">
        <button onClick={onBack} className="self-start mb-3 text-xs font-bold text-gray-400">
          ← Quay lại
        </button>
        <div className="text-4xl mb-2">🔑</div>
        <h1 className="text-2xl font-extrabold text-gray-700 mb-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
          Tham gia phòng
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Nhập mã 6 ký tự mà người ấy đã gửi cho bạn (hoặc bấm thẳng vào link mời sẽ tự điền sẵn).</p>

        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="VD: K7XQ2P"
            maxLength={8}
            className="w-full text-center text-2xl font-extrabold tracking-[0.2em] rounded-xl border border-gray-200 px-3 py-3 text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 mb-2"
            style={{ fontFamily: DISPLAY_FONT }}
          />
          {error && <div className="text-xs text-rose-500 font-bold mb-2 text-center">{error}</div>}
          <button
            onClick={() => checkCode()}
            disabled={checking}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-sm text-lg"
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
  const tickets = calcTotalTickets(data, active);
  const streak = calcStreak(data, active);
  const col = COLORS[active];
  const flowerEmoji = FLOWERS.find((f) => f.id === data.profiles[active].flower)?.emoji;
  const gender = data.profiles[active].gender;
  const genderEmoji = GENDERS.find((g) => g.id === gender)?.emoji;

  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold text-rose-500" style={{ fontFamily: DISPLAY_FONT }}>
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
          <span className="text-2xl">{data.profiles[active].emoji}</span>
          <span className={`text-base font-bold ${col.text}`} style={{ fontFamily: DISPLAY_FONT }}>
            {data.profiles[active].name}
          </span>
          {genderEmoji && <span className="text-sm">{genderEmoji}</span>}
        </div>
        <div className="text-xs text-gray-400 font-semibold text-right">{getRankTitle(tickets)}</div>
      </div>

      <div className="flex items-center gap-2 mt-2.5">
        <TicketBadge count={tickets} flowerEmoji={flowerEmoji} />
        <div className="flex items-center gap-1 bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-base font-extrabold" style={{ fontFamily: DISPLAY_FONT }}>
          <Flame size={16} /> {streak} ngày
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
          target: 1,
          unit: "lần",
          value: 0,
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

function WaterTimesPopover({ onClose }) {
  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-extrabold text-gray-700 text-lg" style={{ fontFamily: DISPLAY_FONT }}>
            💧 Giờ uống nước gợi ý
          </div>
          <button onClick={onClose} className="text-gray-400 p-1">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          {WATER_REMINDER_TIMES.map((w) => (
            <div key={w.time} className={`flex gap-3 p-2.5 rounded-xl ${w.time === nowStr ? "bg-sky-50 border border-sky-200" : "bg-gray-50"}`}>
              <span className="text-sm font-extrabold text-sky-500 w-12 shrink-0" style={{ fontFamily: DISPLAY_FONT }}>
                {w.time}
              </span>
              <span className="text-xs text-gray-500">{w.tip}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3 text-center">Tổng hợp ý tưởng chung, không thay thế lời khuyên y tế nhé 🌿</p>
      </div>
    </div>
  );
}

function TodayTab({ data, setData, activeProfile, coupleId, onCelebrate, onEncourage }) {
  const active = activeProfile;
  const dk = todayKey();
  const col = COLORS[active];
  const day = data.dailyData[dk]?.[active] || {};
  const tasks = getTasksForProfile(data, active);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showWaterTimes, setShowWaterTimes] = useState(false);
  const flowerEmoji = FLOWERS.find((f) => f.id === data.profiles[active].flower)?.emoji;
  const myGender = data.profiles[active].gender;
  const myDisplayName = data.profiles[active].name;

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

  const maybeCheer = () => {
    if (Math.random() > 0.5) return; // keep it occasional, not every single tap
    const pool = myGender === "nam" ? CHEER_FOR_HIM : myGender === "nu" ? CHEER_FOR_HER : NEUTRAL_CHEER;
    onEncourage({ kind: "cheer", text: pickEncouragement(pool, myDisplayName) });
  };

  const checkCelebrate = (task, oldEntry, newEntry, target) => {
    const oldRatio = calcRatio(task, oldEntry, target);
    const newRatio = calcRatio(task, newEntry, target);
    if (oldRatio < 1 && newRatio >= 1) {
      onCelebrate(flowerEmoji);
      maybeCheer();
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

  const pendingForMe = data.assignedTasks.filter((a) => a.dateKey === dk && a.assignedTo === active);

  const updateAssigned = (taskId, updater) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const t = next.assignedTasks.find((a) => a.id === taskId);
      if (!t) return prev;
      const oldRatio = assignedRatio(t);
      const updated = updater(t);
      Object.assign(t, updated);
      const newRatio = assignedRatio(t);
      if (oldRatio < 1 && newRatio >= 1) {
        t.status = "done";
        setTimeout(() => {
          onCelebrate(flowerEmoji);
          maybeCheer();
        }, 0);
      } else if (newRatio < 1) {
        t.status = "pending";
      }
      return next;
    });
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
              <PendingTaskCard key={task.id} task={task} col={col} onChange={(updater) => updateAssigned(task.id, updater)} />
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
              flowerEmoji={flowerEmoji}
              onShowWaterTimes={task.id === "water" ? () => setShowWaterTimes(true) : null}
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

      {showWaterTimes && <WaterTimesPopover onClose={() => setShowWaterTimes(false)} />}
    </div>
  );
}

function PendingTaskCard({ task, col, onChange }) {
  const ratio = assignedRatio(task);
  const tickets = assignedTickets(task);
  const urgencyClass = URGENCY_COLORS[task.urgency] || DEFAULT_URGENCY_COLOR;
  const value = task.value || 0;
  const target = task.target || 1;
  const step = task.step || 1;
  const unit = task.unit || "lần";
  const challengeIcon = task.urgency ? task.urgency.trim().split(" ").pop() : "🎯";

  return (
    <div className="bg-white rounded-xl p-3 border border-rose-100">
      <div className="flex items-center justify-between mb-1">
        <div className="font-bold text-gray-700 text-sm">{task.title}</div>
        {task.urgency && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyClass}`}>{task.urgency}</span>}
      </div>
      {task.note && <div className="text-xs text-gray-400 mb-1">{task.note}</div>}
      <div className="flex items-center justify-between mb-1.5">
        <LevelBadge ratio={ratio} />
        <span className="text-xs text-amber-500 font-bold">🎯 {tickets}/{task.ticketValue} phiếu</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => onChange((t) => ({ value: Math.max(0, (t.value || 0) - step) }))}
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center shrink-0"
        >
          –
        </button>
        <ProgressBoxWithIcon ratio={Math.min(1, ratio)} colorClass={col.solid} label={`${value} / ${target} ${unit}`}>
          <span key={value} className="text-2xl" style={{ animation: "heroPop 0.4s ease-out" }}>
            {challengeIcon}
          </span>
        </ProgressBoxWithIcon>
        <button
          onClick={() => onChange((t) => ({ value: (t.value || 0) + step }))}
          className={`w-9 h-9 rounded-full ${col.solid} text-white font-bold flex items-center justify-center shrink-0`}
        >
          +
        </button>
      </div>
      {ratio >= 1 && <div className="text-xs font-bold text-emerald-500 mt-2">✅ Đã hoàn thành — minh bạch, không cần tự chấm điểm nữa!</div>}
    </div>
  );
}

function TaskCard({ task, entry, target, ratio, col, flowerEmoji, onChange, onRemoveCustom, onShowWaterTimes }) {
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
  const visual = getTaskVisual(task, ratio, flowerEmoji);
  const isWater = task.theme === "water";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-gray-700 text-sm">{task.name}</span>
            {task.custom && <span className="text-[10px] bg-rose-50 text-rose-400 font-bold px-1.5 py-0.5 rounded-full">riêng</span>}
            {onShowWaterTimes && (
              <button onClick={onShowWaterTimes} className="text-[10px] text-sky-500 font-bold underline">
                giờ uống nước
              </button>
            )}
          </div>
          {visual && <div className="text-[11px] text-gray-400 truncate">{visual.label}</div>}
          {task.hint && <div className="text-[11px] text-gray-400 mt-1">💡 {task.hint}</div>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <LevelBadge ratio={ratio} />
          {onRemoveCustom && (
            <button onClick={onRemoveCustom} className="text-gray-300 hover:text-rose-400">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => onChange((c) => ({ ...c, value: Math.max(0, (c.value ?? 0) - task.step) }))}
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center shrink-0"
        >
          –
        </button>
        <ProgressBoxWithIcon ratio={Math.min(1, ratio)} colorClass={col.solid} label={`${value} / ${target} ${task.unit}`}>
          {isWater ? (
            <GrowingPlant ratio={ratio} flowerEmoji={flowerEmoji} bump={value} compact />
          ) : (
            <span key={visual ? visual.emoji : task.emoji} className="text-3xl" style={{ animation: ratio > 0 ? "heroPop 0.4s ease-out" : "none" }}>
              {visual ? visual.emoji : task.emoji}
            </span>
          )}
        </ProgressBoxWithIcon>
        <button
          onClick={() => onChange((c) => ({ ...c, value: (c.value ?? 0) + task.step }))}
          className={`w-9 h-9 rounded-full ${col.solid} text-white font-bold flex items-center justify-center shrink-0`}
        >
          +
        </button>
      </div>

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
  const [targetQty, setTargetQty] = useState(1);
  const [unit, setUnit] = useState("lần");
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
          target: Number(targetQty) || 1,
          unit: unit.trim() || "lần",
          value: 0,
          ticketValue: Number(ticketValue) || 5,
          urgency,
          status: "pending",
        },
      ],
    }));
    setTitle("");
    setNote("");
    setTargetQty(1);
    setUnit("lần");
    setTicketValue(5);
  };

  const removeTask = (id) => setData((prev) => ({ ...prev, assignedTasks: prev.assignedTasks.filter((t) => t.id !== id) }));

  const givenByMe = data.assignedTasks.filter((t) => t.dateKey === dk && t.assignedBy === active);
  const givenToMe = data.assignedTasks.filter((t) => t.dateKey === dk && t.assignedTo === active);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-sm font-extrabold text-gray-700 mb-1">✍️ Thử thách dành cho {nameOf(data, other)}</div>
        <p className="text-[11px] text-gray-400 mb-3">Đặt số lượng cụ thể (VD: mang 5 bao gạo) — hoàn thành sẽ tự tính theo tiến độ thật, không cần tự chấm điểm nữa.</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên nhiệm vụ, VD: Mang gạo lên nhà"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú thêm (không bắt buộc)"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={targetQty}
            onChange={(e) => setTargetQty(e.target.value)}
            placeholder="Số lượng"
            className="w-24 rounded-xl border border-gray-200 px-2.5 py-2 text-sm text-center"
            min={1}
          />
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Đơn vị, VD: bao gạo"
            className="flex-1 rounded-xl border border-gray-200 px-2.5 py-2 text-sm"
          />
        </div>
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
          {givenToMe.map((t) => {
            const ratio = assignedRatio(t);
            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-700 text-sm">{t.title}</div>
                  <LevelBadge ratio={ratio} />
                </div>
                {t.note && <div className="text-xs text-gray-400">{t.note}</div>}
                <div className="text-xs text-amber-500 font-bold mt-1">
                  {t.value || 0} / {t.target} {t.unit} · 🎯 {assignedTickets(t)} phiếu
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase px-1 mb-2">Bạn đã tạo</div>
        {givenByMe.length === 0 && <div className="text-sm text-gray-400 px-1">Chưa tạo gì hôm nay 📝</div>}
        <div className="space-y-2">
          {givenByMe.map((t) => {
            const ratio = assignedRatio(t);
            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-700 text-sm">{t.title}</div>
                  <div className="text-xs text-amber-500 font-bold">
                    {t.value || 0} / {t.target} {t.unit} · 🎯 {assignedTickets(t)} phiếu
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LevelBadge ratio={ratio} />
                  {ratio < 1 && (
                    <button onClick={() => removeTask(t.id)} className="text-gray-300 hover:text-rose-400">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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

function MoodTab({ data, setData, activeProfile, onEncourage }) {
  const active = activeProfile;
  const dk = todayKey();
  const flowerEmoji = FLOWERS.find((f) => f.id === data.profiles[active].flower)?.emoji;
  const myGender = data.profiles[active].gender;
  const myDisplayName = data.profiles[active].name;
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

  const selectMood = (moodId) => {
    update({ mood: moodId });
    if (LOW_MOODS.includes(moodId)) {
      const pool = myGender === "nu" ? COMFORT_FOR_HER : myGender === "nam" ? COMFORT_FOR_HIM : NEUTRAL_COMFORT;
      onEncourage({ kind: "comfort", text: pickEncouragement(pool, myDisplayName) });
    }
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
              onClick={() => selectMood(m.id)}
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
  const [p1Gender, setP1Gender] = useState(data.profiles.p1.gender || "");
  const [p2Gender, setP2Gender] = useState(data.profiles.p2.gender || "");
  const [p1Role, setP1Role] = useState(data.profiles.p1.roleTitle || "");
  const [p2Role, setP2Role] = useState(data.profiles.p2.roleTitle || "");
  const [targets, setTargets] = useState(structuredClone(data.targets));
  const [urgencyLevels, setUrgencyLevels] = useState([...data.urgencyLevels]);
  const [newUrgency, setNewUrgency] = useState("");

  const save = () => {
    setData((prev) => ({
      ...prev,
      profiles: {
        p1: { ...prev.profiles.p1, name: p1Name.trim() || prev.profiles.p1.name, flower: p1Flower, gender: p1Gender, roleTitle: p1Role },
        p2: { ...prev.profiles.p2, name: p2Name.trim() || prev.profiles.p2.name, flower: p2Flower, gender: p2Gender, roleTitle: p2Role },
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
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Giới tính</div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => (pid === "p1" ? setP1Gender(g.id) : setP2Gender(g.id))}
                  className={`text-xs font-bold px-2 py-1 rounded-full border ${
                    (pid === "p1" ? p1Gender : p2Gender) === g.id ? "border-rose-400 bg-rose-50" : "border-gray-200 text-gray-400"
                  }`}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Hoa yêu thích</div>
            <div className="flex flex-wrap gap-1.5 mb-2">
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
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Là gì của người kia</div>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_TITLES.map((r) => (
                <button
                  key={r}
                  onClick={() => (pid === "p1" ? setP1Role(r) : setP2Role(r))}
                  className={`text-[11px] font-bold px-2 py-1 rounded-full border ${
                    (pid === "p1" ? p1Role : p2Role) === r ? "border-rose-400 bg-rose-50" : "border-gray-200 text-gray-400"
                  }`}
                >
                  {r}
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
          <p className="text-[11px] text-gray-400 mt-1.5">* Cần cho phép quyền thông báo của trình duyệt; có thể không khả dụng trên mọi thiết bị. Khi bật, app sẽ thử nhắc bạn vào các giờ uống nước gợi ý.</p>
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

// Lets a shared link like https://yourapp.com/?join=K7XQ2P drop the other person
// straight into the join flow with the code already filled in — no separate
// "open link, then copy the code, then paste it" steps.
function getJoinCodeFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("join");
    return code ? code.trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [coupleId, setCoupleId] = useState(() => loadSession()?.coupleId || null);
  const [activeProfile, setActiveProfile] = useState(() => loadSession()?.profileId || null);
  const [data, setDataRaw] = useState(null);
  const [connecting, setConnecting] = useState(!!loadSession());
  const [connectError, setConnectError] = useState(null); // "denied" | "timeout" | "notfound" | null
  const [retryKey, setRetryKey] = useState(0);
  const [screen, setScreen] = useState(() => (getJoinCodeFromUrl() ? "join" : "welcome")); // welcome | create | join | reveal
  const [revealCode, setRevealCode] = useState(null);

  const [tab, setTab] = useState("today");
  const [showSettings, setShowSettings] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [toast, setToast] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const writeTimer = useRef(null);
  const lastWaterPing = useRef("");

  // Subscribe to the couple's data in Firebase Realtime Database whenever we have a coupleId.
  // Every update from either device (including our own writes) flows back through here,
  // which is what gives the realtime "no refresh needed" sync.
  //
  // This used to be able to hang on the "connecting..." screen forever with zero feedback —
  // e.g. if the Firebase Realtime Database rules deny read access. Now: a read error surfaces
  // immediately, a room that genuinely doesn't exist (null after the first real response) is
  // reported instead of treated as "still loading", and a timeout catches any other silent hang.
  useEffect(() => {
    if (!coupleId) return;
    setConnecting(true);
    setConnectError(null);
    let gotFirstResponse = false;

    const timeout = setTimeout(() => {
      if (!gotFirstResponse) {
        setConnecting(false);
        setConnectError("timeout");
      }
    }, 10000);

    const unsubscribe = subscribeCouple(
      coupleId,
      (val) => {
        gotFirstResponse = true;
        clearTimeout(timeout);
        setConnecting(false);
        if (val === null) {
          setConnectError("notfound");
        } else {
          setDataRaw(normalizeCoupleData(val));
          setConnectError(null);
        }
      },
      () => {
        gotFirstResponse = true;
        clearTimeout(timeout);
        setConnecting(false);
        setConnectError("denied");
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [coupleId, retryKey]);

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
  const encourage = (toastObj) => setToast(toastObj);

  // Best-effort water-time reminder — only fires if the browser granted notification
  // permission; checks the clock every 30s against the suggested times. This cannot
  // guarantee delivery the way a real native push notification would.
  useEffect(() => {
    const check = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const match = WATER_REMINDER_TIMES.find((w) => w.time === hhmm);
      if (match && lastWaterPing.current !== hhmm) {
        lastWaterPing.current = hhmm;
        try {
          new Notification("💧 Giờ uống nước rồi!", { body: match.tip });
        } catch {
          // ignore
        }
      }
    };
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

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
          onJoined={(code, profileId) => handleLoggedIntoRoom(code, profileId || "p2")}
          initialCode={getJoinCodeFromUrl()}
        />
      );
    }
    return <WelcomeScreen onPickCreate={() => setScreen("create")} onPickJoin={() => setScreen("join")} />;
  }

  // Paired, but still waiting on the first snapshot from Firebase.
  if (connecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 gap-2">
        <div className="text-3xl animate-pulse">💞</div>
        <div className="text-xs font-bold text-gray-400">Đang kết nối với phòng của hai bạn...</div>
      </div>
    );
  }

  // Connection finished but something's wrong — show what happened instead of hanging forever.
  if (connectError || !data) {
    const messages = {
      denied: {
        title: "Không có quyền đọc dữ liệu phòng 🔒",
        detail: "Firebase Realtime Database đang chặn đọc/ghi. Vào Firebase Console → Realtime Database → Rules, mở quyền .read/.write cho couples/$coupleId rồi thử lại.",
      },
      timeout: {
        title: "Kết nối quá lâu, có gì đó không ổn 🐢",
        detail: "Có thể do mạng chậm/chặn, hoặc cấu hình Firebase chưa đúng. Kiểm tra kết nối mạng rồi bấm thử lại.",
      },
      notfound: {
        title: "Không tìm thấy phòng này 💔",
        detail: "Phòng có thể đã bị xoá trên Firebase, hoặc thiết bị này đang nhớ nhầm mã phòng cũ. Rời khỏi thiết bị này rồi tạo/tham gia phòng lại nhé.",
      },
    };
    const m = messages[connectError] || messages.notfound;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 gap-3 px-6 text-center">
        <div className="text-4xl">😵</div>
        <div className="font-extrabold text-gray-700" style={{ fontFamily: DISPLAY_FONT }}>
          {m.title}
        </div>
        <div className="text-xs text-gray-400 max-w-xs">{m.detail}</div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-full text-sm"
          >
            Thử lại
          </button>
          <button
            onClick={handleLogout}
            className="bg-white border border-gray-200 text-gray-500 font-bold px-5 py-2.5 rounded-full text-sm"
          >
            Rời khỏi thiết bị này
          </button>
        </div>
      </div>
    );
  }

  const dk = todayKey();
  const pendingCount = data.assignedTasks.filter((a) => a.dateKey === dk && a.assignedTo === activeProfile && assignedRatio(a) < 1).length;
  const alertCount = computeAlerts(data).filter((a) => a.profileId !== activeProfile).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white flex flex-col" style={{ fontFamily: BODY_FONT }}>
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
          0% { left: -10%; transform: translateY(0) scaleX(1); opacity: 0; }
          10% { opacity: 1; }
          30% { left: 35%; transform: translateY(-8px) scaleX(1); }
          45% { left: 45%; transform: translateY(4px) scaleX(1); }
          50% { left: 45%; transform: translateY(4px) scaleX(-1); }
          70% { left: 20%; transform: translateY(-6px) scaleX(-1); }
          90% { opacity: 1; }
          100% { left: -10%; transform: translateY(0) scaleX(-1); opacity: 0; }
        }
        @keyframes bunnyHop {
          0% { left: -10%; transform: translateY(0); opacity: 0; }
          6% { opacity: 1; }
          15% { transform: translateY(-16px); }
          25% { transform: translateY(0); }
          35% { transform: translateY(-16px); }
          45% { transform: translateY(0); }
          55% { transform: translateY(-16px); }
          65% { transform: translateY(0); }
          75% { transform: translateY(-16px); }
          94% { opacity: 1; }
          100% { left: 105%; transform: translateY(0); opacity: 0; }
        }
        @keyframes kissWave {
          0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
          15% { transform: scale(1.1) rotate(-8deg); opacity: 1; }
          30% { transform: scale(1) rotate(8deg); }
          45% { transform: scale(1.1) rotate(-8deg); }
          60% { transform: scale(1) rotate(8deg); }
          75% { transform: scale(1.05) rotate(-6deg); opacity: 1; }
          100% { transform: scale(0.7) rotate(0deg); opacity: 0; }
        }
        @keyframes pawPrint {
          0% { opacity: 0; transform: scale(0.6); }
          40% { opacity: 0.55; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes heroPop {
          0% { transform: scale(0.7) rotate(-8deg); }
          60% { transform: scale(1.15) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes toastPop {
          0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes plantWater {
          0% { transform: scale(0.96); }
          40% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      <Header data={data} activeProfile={activeProfile} onOpenSettings={() => setShowSettings(true)} onOpenAlerts={() => setShowAlerts(true)} alertCount={alertCount} />

      <div className="flex-1 overflow-y-auto">
        {tab === "today" && (
          <TodayTab data={data} setData={setData} activeProfile={activeProfile} coupleId={coupleId} onCelebrate={celebrate} onEncourage={encourage} />
        )}
        {tab === "tasks" && <TasksTab data={data} setData={setData} activeProfile={activeProfile} onCelebrate={celebrate} />}
        {tab === "mood" && <MoodTab data={data} setData={setData} activeProfile={activeProfile} onEncourage={encourage} />}
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
      <EncouragementToast toast={toast} onDone={() => setToast(null)} />
      <AmbientCritters />
    </div>
  );
}