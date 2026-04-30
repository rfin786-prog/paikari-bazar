“use client”;
import { useEffect, useRef } from “react”;

const SHOPS = [
{ id: 1, name: “ভাই ভাই মুদি খানা”, type: “grocery”, x: 180 },
{ id: 2, name: “সালাম টি স্টল”, type: “tea”, x: 420 },
{ id: 3, name: “আল্লাহর দান রেস্তোরাঁ”, type: “restaurant”, x: 660 },
];

export default function AnimationSection() {
const canvasRef = useRef(null);
const animRef = useRef(null);

useEffect(() => {
const canvas = canvasRef.current;
const ctx = canvas.getContext(“2d”);
const BASE_W = 860;

```
function resize() {
  const parent = canvas.parentElement;
  canvas.width = parent.offsetWidth;
  canvas.height = Math.max(200, Math.min(320, parent.offsetWidth * 0.42));
}
resize();
window.addEventListener("resize", resize);

function sc(val) { return (val / BASE_W) * canvas.width; }

const state = {
  phase: "godown_wait",
  truckX: sc(-140),
  driverVisible: false,
  driverX: 0,
  driverGoingToShop: false,
  driverHasCargo: false,
  currentShop: 0,
  smokeParticles: [],
  phaseTimer: 0,
  shopDone: [false, false, false],
  windAngle: 0,
  birds: [
    { x: 80, y: 0.17, wing: 0, spd: 0.35 },
    { x: 260, y: 0.12, wing: 12, spd: 0.28 },
    { x: 530, y: 0.19, wing: 6, spd: 0.42 },
  ],
  clouds: [
    { x: 90, yf: 0.1, w: 80 },
    { x: 370, yf: 0.07, w: 100 },
    { x: 640, yf: 0.12, w: 65 },
  ],
};

let frame = 0;

function drawSky(W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.58);
  g.addColorStop(0, "#4A90C4");
  g.addColorStop(1, "#AED6F1");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H * 0.58);
}

function drawSun(H) {
  const x = sc(55), y = H * 0.16;
  ctx.save();
  ctx.shadowColor = "#FFE066"; ctx.shadowBlur = sc(14);
  ctx.fillStyle = "#FFD700";
  ctx.beginPath(); ctx.arc(x, y, sc(22), 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#FFD700"; ctx.lineWidth = sc(2);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * sc(27), y + Math.sin(a) * sc(27));
    ctx.lineTo(x + Math.cos(a) * sc(35), y + Math.sin(a) * sc(35));
    ctx.stroke();
  }
  ctx.restore();
}

function drawCloud(x, y, w) {
  ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath(); ctx.ellipse(x, y, sc(w) * 0.52, sc(12), 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - sc(w) * 0.22, y + sc(5), sc(w) * 0.32, sc(9), 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + sc(w) * 0.22, y + sc(4), sc(w) * 0.28, sc(8), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBird(bx, by, wing) {
  ctx.save(); ctx.strokeStyle = "#1A252F"; ctx.lineWidth = sc(1.4);
  const flap = Math.sin(wing * 0.15) * sc(4);
  ctx.beginPath();
  ctx.moveTo(bx - sc(7), by);
  ctx.quadraticCurveTo(bx - sc(3), by - flap, bx, by);
  ctx.quadraticCurveTo(bx + sc(3), by - flap, bx + sc(7), by);
  ctx.stroke(); ctx.restore();
}

function drawGround(W, H) {
  const gY = H * 0.58;
  ctx.fillStyle = "#7D6040"; ctx.fillRect(0, gY, W, H - gY);
  ctx.fillStyle = "#4A4A4A"; ctx.fillRect(0, gY + sc(8), W, sc(52));
  ctx.strokeStyle = "#F0C040"; ctx.lineWidth = sc(2); ctx.setLineDash([sc(22), sc(14)]);
  ctx.beginPath(); ctx.moveTo(0, gY + sc(34)); ctx.lineTo(W, gY + sc(34)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#B8A080"; ctx.fillRect(0, gY - sc(10), W, sc(10));
}

function drawGodown(H) {
  const gY = H * 0.58;
  const gx = sc(10), gy = gY - sc(80);
  ctx.fillStyle = "#9B7A2E"; ctx.fillRect(gx, gy, sc(75), sc(80));
  ctx.fillStyle = "#6B5520";
  ctx.beginPath(); ctx.moveTo(gx - sc(4), gy); ctx.lineTo(gx + sc(37), gy - sc(18)); ctx.lineTo(gx + sc(79), gy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3D2B10"; ctx.fillRect(gx + sc(20), gy + sc(35), sc(32), sc(45));
  ctx.fillStyle = "#FFD700"; ctx.font = `bold ${sc(8)}px sans-serif`; ctx.textAlign = "center";
  ctx.fillText("গোডাউন", gx + sc(37), gy + sc(22));
}

function drawTree(tx, H, windAngle) {
  const gY = H * 0.58;
  const sway = Math.sin(windAngle + tx * 0.003) * sc(5);
  ctx.save(); ctx.translate(tx, gY - sc(2));

  // Trunk with curve (sway)
  ctx.strokeStyle = "#5C3A1A"; ctx.lineWidth = sc(7); ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(sway * 0.3, -sc(28), sway * 0.6, -sc(55));
  ctx.stroke();

  // Side branches
  const bData = [
    { yf: 0.45, ang: -65, len: sc(24), sw: 0.5 },
    { yf: 0.6,  ang: -115, len: sc(20), sw: 0.6 },
    { yf: 0.75, ang: -72, len: sc(17), sw: 0.7 },
    { yf: 0.82, ang: -108, len: sc(15), sw: 0.75 },
  ];
  bData.forEach(({ yf, ang, len, sw }) => {
    const bStartX = sway * yf * 0.5;
    const bStartY = -sc(55) * yf;
    const bEndX = bStartX + Math.cos((ang * Math.PI) / 180) * len + sway * sw * 0.4;
    const bEndY = bStartY + Math.sin((ang * Math.PI) / 180) * len;

    ctx.strokeStyle = "#5C3A1A"; ctx.lineWidth = sc(2.8); ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bStartX, bStartY);
    ctx.quadraticCurveTo((bStartX + bEndX) / 2 + sway * 0.15, (bStartY + bEndY) / 2, bEndX, bEndY);
    ctx.stroke();

    // Sub-branches
    const subLen = len * 0.45;
    [-35, 35].forEach((subAng) => {
      const sa = ((ang + subAng) * Math.PI) / 180;
      const sx2 = bEndX + Math.cos(sa) * subLen;
      const sy2 = bEndY + Math.sin(sa) * subLen;
      ctx.strokeStyle = "#7B5530"; ctx.lineWidth = sc(1.5);
      ctx.beginPath(); ctx.moveTo(bEndX, bEndY); ctx.lineTo(sx2, sy2); ctx.stroke();
    });

    // Leaves at branch tip (multiple ellipses)
    const lColors = ["#27AE60", "#1E8449", "#2ECC71", "#229954"];
    lColors.forEach((c, ci) => {
      const ox = (ci % 2 === 0 ? 1 : -1) * sc(ci * 3);
      ctx.fillStyle = c; ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.ellipse(bEndX + ox + sway * 0.1, bEndY - sc(3) - ci * sc(2), sc(10 - ci), sc(7 - ci * 0.5), sway * 0.04, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  });

  // Top canopy (multiple overlapping blobs)
  const topX = sway * 0.7, topY = -sc(57);
  const canopy = [
    { dx: 0, dy: 0, rx: sc(20), ry: sc(15), c: "#1E8449" },
    { dx: -sc(12), dy: sc(8), rx: sc(15), ry: sc(11), c: "#27AE60" },
    { dx: sc(12), dy: sc(8), rx: sc(14), ry: sc(10), c: "#229954" },
    { dx: sc(0), dy: sc(15), rx: sc(17), ry: sc(9), c: "#2ECC71" },
    { dx: -sc(6), dy: sc(4), rx: sc(10), ry: sc(8), c: "#58D68D" },
  ];
  canopy.forEach(({ dx, dy, rx, ry, c }) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(topX + dx, topY + dy, rx, ry, sway * 0.02, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawHouse(hxRaw, H) {
  const gY = H * 0.58;
  const hx = sc(hxRaw), hy = gY - sc(62);
  ctx.fillStyle = "#E8C49A"; ctx.fillRect(hx, hy, sc(50), sc(62));
  ctx.fillStyle = "#A93226";
  ctx.beginPath(); ctx.moveTo(hx - sc(4), hy); ctx.lineTo(hx + sc(25), hy - sc(20)); ctx.lineTo(hx + sc(54), hy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#AED6F1"; ctx.fillRect(hx + sc(6), hy + sc(14), sc(13), sc(13)); ctx.fillRect(hx + sc(30), hy + sc(14), sc(13), sc(13));
  ctx.fillStyle = "#6B4226"; ctx.fillRect(hx + sc(16), hy + sc(36), sc(17), sc(26));
}

function drawGroceryShop(H) {
  const gY = H * 0.58;
  const sx = sc(SHOPS[0].x), sy = gY - sc(82);
  ctx.fillStyle = "#F0E0C0"; ctx.fillRect(sx, sy, sc(88), sc(82));
  ctx.fillStyle = "#C0392B"; ctx.fillRect(sx - sc(4), sy - sc(8), sc(96), sc(12));
  ctx.fillStyle = "#E74C3C";
  ctx.beginPath(); ctx.moveTo(sx - sc(4), sy + sc(4)); ctx.lineTo(sx + sc(92), sy + sc(4)); ctx.lineTo(sx + sc(86), sy + sc(20)); ctx.lineTo(sx + sc(2), sy + sc(20)); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = "rgba(255,255,255,0.38)"; ctx.fillRect(sx + sc(i * 17), sy + sc(4), sc(9), sc(16)); }
  ctx.fillStyle = "#AED6F1"; ctx.fillRect(sx + sc(6), sy + sc(26), sc(32), sc(26));
  ["#E74C3C","#F39C12","#27AE60","#8E44AD"].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(sx + sc(9 + i * 7), sy + sc(37), sc(5), sc(11)); });
  ctx.fillStyle = "#5D4E37"; ctx.fillRect(sx + sc(48), sy + sc(35), sc(28), sc(47));
  ctx.fillStyle = "#1A252F"; ctx.fillRect(sx, sy - sc(20), sc(88), sc(16));
  ctx.fillStyle = "#FFD700"; ctx.font = `bold ${sc(6.5)}px sans-serif`; ctx.textAlign = "center";
  ctx.fillText("ভাই ভাই মুদি খানা", sx + sc(44), sy - sc(8));
}

function drawTeaShop(H) {
  const gY = H * 0.58;
  const sx = sc(SHOPS[1].x), sy = gY - sc(72);
  // Posts
  ctx.strokeStyle = "#8B6914"; ctx.lineWidth = sc(5);
  [sx, sx + sc(68)].forEach((px) => { ctx.beginPath(); ctx.moveTo(px, gY - sc(2)); ctx.lineTo(px, sy); ctx.stroke(); });
  // Bamboo knuckles on posts
  [sx, sx + sc(68)].forEach((px) => {
    ctx.strokeStyle = "#A0781E"; ctx.lineWidth = sc(1.2);
    for (let y = sy + sc(10); y < gY; y += sc(14)) { ctx.beginPath(); ctx.moveTo(px - sc(3), y); ctx.lineTo(px + sc(3), y); ctx.stroke(); }
  });
  // Vertical bamboo walls
  ctx.strokeStyle = "#C4A020"; ctx.lineWidth = sc(2.2);
  for (let x = sx + sc(5); x < sx + sc(68); x += sc(5.5)) { ctx.beginPath(); ctx.moveTo(x, sy + sc(6)); ctx.lineTo(x, gY - sc(2)); ctx.stroke(); }
  // Thatched roof
  ctx.fillStyle = "#9B7A3A";
  ctx.beginPath(); ctx.moveTo(sx - sc(7), sy); ctx.lineTo(sx + sc(34), sy - sc(17)); ctx.lineTo(sx + sc(75), sy); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 8; i++) { ctx.strokeStyle = "#6B5A2A"; ctx.lineWidth = sc(1); ctx.beginPath(); ctx.moveTo(sx - sc(7) + sc(i * 9), sy); ctx.lineTo(sx + sc(27) + sc(i * 6), sy - sc(15)); ctx.stroke(); }
  // Table
  ctx.fillStyle = "#7B5E37"; ctx.fillRect(sx + sc(10), sy + sc(38), sc(44), sc(4)); ctx.fillRect(sx + sc(13), sy + sc(42), sc(4), sc(20)); ctx.fillRect(sx + sc(46), sy + sc(42), sc(4), sc(20));
  // Cups with steam
  [sx + sc(18), sx + sc(30), sx + sc(42)].forEach((cx) => {
    ctx.fillStyle = "#FFF"; ctx.beginPath(); ctx.ellipse(cx, sy + sc(38), sc(5), sc(3), 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#E8A0A0"; ctx.lineWidth = sc(1); ctx.beginPath(); ctx.moveTo(cx, sy + sc(35)); ctx.quadraticCurveTo(cx + sc(3), sy + sc(30), cx, sy + sc(26)); ctx.stroke();
  });
  // TEA SHOP PERSON (sitting shopkeeper)
  const px = sx + sc(55), py = gY - sc(2);
  // Stool
  ctx.fillStyle = "#7B5E37"; ctx.fillRect(px - sc(8), py - sc(16), sc(16), sc(3)); ctx.fillRect(px - sc(6), py - sc(13), sc(3), sc(13)); ctx.fillRect(px + sc(3), py - sc(13), sc(3), sc(13));
  // Sitting legs
  ctx.fillStyle = "#1C2833"; ctx.fillRect(px - sc(7), py - sc(13), sc(5), sc(8)); ctx.fillRect(px + sc(2), py - sc(13), sc(5), sc(8));
  // Feet extended
  ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.ellipse(px - sc(5), py - sc(4), sc(6), sc(3), -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(px + sc(5), py - sc(4), sc(6), sc(3), 0.3, 0, Math.PI * 2); ctx.fill();
  // Body/shirt (lungi style)
  ctx.fillStyle = "#27AE60"; ctx.fillRect(px - sc(6), py - sc(30), sc(12), sc(16));
  // Neck
  ctx.fillStyle = "#F0C060"; ctx.fillRect(px - sc(3), py - sc(33), sc(6), sc(4));
  // Head
  ctx.fillStyle = "#D4A054"; ctx.beginPath(); ctx.ellipse(px, py - sc(40), sc(8), sc(9), 0, 0, Math.PI * 2); ctx.fill();
  // Hair
  ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.ellipse(px, py - sc(46), sc(8), sc(5), 0, Math.PI, 0); ctx.fill();
  // Eye
  ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.arc(px + sc(3), py - sc(40), sc(1.5), 0, Math.PI * 2); ctx.fill();
  // Mustache
  ctx.strokeStyle = "#1A1A1A"; ctx.lineWidth = sc(1.2);
  ctx.beginPath(); ctx.moveTo(px - sc(3), py - sc(36)); ctx.quadraticCurveTo(px, py - sc(34), px + sc(3), py - sc(36)); ctx.stroke();
  // Arms holding cup
  ctx.fillStyle = "#27AE60"; ctx.fillRect(px - sc(12), py - sc(28), sc(5), sc(10)); ctx.fillRect(px + sc(7), py - sc(28), sc(5), sc(10));
  ctx.fillStyle = "#F0C060"; ctx.beginPath(); ctx.arc(px - sc(9), py - sc(19), sc(3.5), 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(px + sc(9), py - sc(19), sc(3.5), 0, Math.PI * 2); ctx.fill();
  // Cup in hands
  ctx.fillStyle = "#FFFDE7"; ctx.fillRect(px - sc(11), py - sc(22), sc(7), sc(5));
  ctx.strokeStyle = "#8D6E63"; ctx.lineWidth = sc(0.8); ctx.strokeRect(px - sc(11), py - sc(22), sc(7), sc(5));
  // Sign
  ctx.fillStyle = "#2C3E50"; ctx.fillRect(sx, sy - sc(24), sc(70), sc(16));
  ctx.fillStyle = "#FFD700"; ctx.font = `bold ${sc(6.5)}px sans-serif`; ctx.textAlign = "center";
  ctx.fillText("সালাম টি স্টল", sx + sc(35), sy - sc(12));
}

function drawRestaurant(H) {
  const gY = H * 0.58;
  const sx = sc(SHOPS[2].x), sy = gY - sc(92);
  ctx.fillStyle = "#F5E6C8"; ctx.fillRect(sx, sy, sc(92), sc(92));
  ctx.fillStyle = "#D4AC6E"; [sx + sc(4), sx + sc(80)].forEach((cx) => { ctx.fillRect(cx, sy, sc(8), sc(92)); });
  ctx.fillStyle = "#1A252F"; ctx.fillRect(sx - sc(5), sy - sc(10), sc(102), sc(14));
  [[sx + sc(14), sy + sc(18)], [sx + sc(56), sy + sc(18)]].forEach(([wx, wy]) => {
    ctx.fillStyle = "#AED6F1"; ctx.fillRect(wx, wy, sc(22), sc(22));
    ctx.strokeStyle = "#5D6D7E"; ctx.lineWidth = sc(1.2); ctx.strokeRect(wx, wy, sc(22), sc(22));
    ctx.beginPath(); ctx.moveTo(wx + sc(11), wy); ctx.lineTo(wx + sc(11), wy + sc(22)); ctx.moveTo(wx, wy + sc(11)); ctx.lineTo(wx + sc(22), wy + sc(11)); ctx.stroke();
  });
  ctx.fillStyle = "#784212"; ctx.fillRect(sx + sc(32), sy + sc(48), sc(28), sc(44));
  ctx.beginPath(); ctx.arc(sx + sc(46), sy + sc(48), sc(14), Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#154360"; ctx.fillRect(sx, sy - sc(28), sc(92), sc(20));
  ctx.fillStyle = "#F8C471"; ctx.font = `bold ${sc(6)}px sans-serif`; ctx.textAlign = "center";
  ctx.fillText("আল্লাহর দান রেস্তোরাঁ", sx + sc(46), sy - sc(13));
}

// Truck goes LEFT→RIGHT, cabin on RIGHT, exhaust on LEFT (rear)
function drawTruck(tx, H) {
  const gY = H * 0.58;
  const ty = gY + sc(12);

  // Exhaust smoke from LEFT/REAR
  if (frame % 4 === 0) {
    state.smokeParticles.push({
      x: tx + sc(8), y: ty - sc(10),
      vx: -sc(0.6) + Math.random() * sc(0.3),
      vy: -sc(0.5) - Math.random() * sc(0.4),
      alpha: 0.55, r: sc(4),
    });
  }
  state.smokeParticles.forEach((p) => {
    ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = "#999";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    p.x += p.vx; p.y += p.vy; p.alpha -= 0.011; p.r += sc(0.12);
  });
  state.smokeParticles = state.smokeParticles.filter((p) => p.alpha > 0.02);

  // Cargo box (LEFT portion)
  ctx.fillStyle = "#2C3E50"; ctx.fillRect(tx, ty - sc(42), sc(80), sc(42));
  // Rear door (leftmost)
  ctx.fillStyle = "#1A252F"; ctx.fillRect(tx, ty - sc(40), sc(14), sc(40));
  // Cargo lines
  ctx.strokeStyle = "#3D5166"; ctx.lineWidth = sc(1);
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(tx + sc(18 + i * 14), ty - sc(42)); ctx.lineTo(tx + sc(18 + i * 14), ty); ctx.stroke(); }

  // Cabin (RIGHT side - direction of travel)
  ctx.fillStyle = "#E74C3C"; ctx.fillRect(tx + sc(80), ty - sc(36), sc(35), sc(36));
  ctx.fillStyle = "#C0392B"; ctx.beginPath(); ctx.arc(tx + sc(97), ty - sc(36), sc(17), Math.PI, 0); ctx.fill();
  // Windshield
  ctx.fillStyle = "#85C1E9"; ctx.fillRect(tx + sc(84), ty - sc(30), sc(26), sc(18));
  ctx.strokeStyle = "#5D6D7E"; ctx.lineWidth = sc(1); ctx.strokeRect(tx + sc(84), ty - sc(30), sc(26), sc(18));
  // Headlight right
  ctx.fillStyle = "#F9E79F"; ctx.fillRect(tx + sc(111), ty - sc(14), sc(5), sc(7));
  // Exhaust pipe bottom-left
  ctx.fillStyle = "#555"; ctx.fillRect(tx + sc(12), ty - sc(2), sc(6), sc(6));

  // Wheels
  [tx + sc(20), tx + sc(95)].forEach((wx) => {
    ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.arc(wx, ty, sc(13), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#555"; ctx.beginPath(); ctx.arc(wx, ty, sc(6), 0, Math.PI * 2); ctx.fill();
    const a = (frame * 0.08) % (Math.PI * 2);
    ctx.strokeStyle = "#888"; ctx.lineWidth = sc(1.5);
    for (let i = 0; i < 4; i++) {
      const ang = a + (i * Math.PI) / 2;
      ctx.beginPath(); ctx.moveTo(wx + Math.cos(ang) * sc(3), ty + Math.sin(ang) * sc(3)); ctx.lineTo(wx + Math.cos(ang) * sc(10), ty + Math.sin(ang) * sc(10)); ctx.stroke();
    }
  });
}

function drawHuman(dx, H, hasCargo, facingRight) {
  const gY = H * 0.58;
  const hy = gY + sc(12); // ground level
  ctx.save();
  if (!facingRight) { ctx.translate(dx * 2, 0); ctx.scale(-1, 1); }
  const hx = dx;

  // Shoes
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.ellipse(hx - sc(4), hy, sc(6), sc(3), 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + sc(4), hy, sc(6), sc(3), 0, 0, Math.PI * 2); ctx.fill();
  // Trousers
  ctx.fillStyle = "#1C2833"; ctx.fillRect(hx - sc(7), hy - sc(20), sc(6), sc(20)); ctx.fillRect(hx + sc(1), hy - sc(20), sc(6), sc(20));
  // Belt
  ctx.fillStyle = "#7B4A00"; ctx.fillRect(hx - sc(7), hy - sc(22), sc(14), sc(3));
  // Shirt body
  ctx.fillStyle = "#2471A3"; ctx.fillRect(hx - sc(7), hy - sc(38), sc(14), sc(18));
  // Collar
  ctx.fillStyle = "#154360"; ctx.fillRect(hx - sc(3), hy - sc(38), sc(6), sc(5));
  if (hasCargo) {
    // Arms stretched holding box
    ctx.fillStyle = "#2471A3"; ctx.fillRect(hx - sc(15), hy - sc(36), sc(8), sc(12)); ctx.fillRect(hx + sc(7), hy - sc(36), sc(8), sc(12));
    // Hands
    ctx.fillStyle = "#F0C060"; ctx.beginPath(); ctx.arc(hx - sc(11), hy - sc(25), sc(4), 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(hx + sc(11), hy - sc(25), sc(4), 0, Math.PI * 2); ctx.fill();
    // Cargo box
    ctx.fillStyle = "#E67E22"; ctx.fillRect(hx - sc(14), hy - sc(40), sc(28), sc(16)); ctx.strokeStyle = "#CA6F1E"; ctx.lineWidth = sc(1); ctx.strokeRect(hx - sc(14), hy - sc(40), sc(28), sc(16));
    ctx.strokeStyle = "#F0B000"; ctx.lineWidth = sc(1.5); ctx.beginPath(); ctx.moveTo(hx - sc(14), hy - sc(32)); ctx.lineTo(hx + sc(14), hy - sc(32)); ctx.stroke();
  } else {
    ctx.fillStyle = "#2471A3"; ctx.fillRect(hx - sc(12), hy - sc(36), sc(5), sc(14)); ctx.fillRect(hx + sc(7), hy - sc(36), sc(5), sc(14));
    ctx.fillStyle = "#F0C060"; ctx.beginPath(); ctx.arc(hx - sc(9), hy - sc(23), sc(4), 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(hx + sc(9), hy - sc(23), sc(4), 0, Math.PI * 2); ctx.fill();
  }
  // Neck
  ctx.fillStyle = "#F0C060"; ctx.fillRect(hx - sc(3), hy - sc(42), sc(6), sc(5));
  // Head
  ctx.fillStyle = "#D4A054"; ctx.beginPath(); ctx.ellipse(hx, hy - sc(49), sc(8), sc(9), 0, 0, Math.PI * 2); ctx.fill();
  // Hair
  ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.ellipse(hx, hy - sc(56), sc(8), sc(5.5), 0, Math.PI, 0); ctx.fill();
  // Cap
  ctx.fillStyle = "#154360"; ctx.fillRect(hx - sc(9), hy - sc(58), sc(18), sc(5));
  // Eye (right side since facing right by default)
  ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.arc(hx + sc(4), hy - sc(50), sc(1.5), 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx - sc(2), hy - sc(50), sc(1.5), 0, Math.PI * 2); ctx.fill();
  // Eyebrows
  ctx.strokeStyle = "#1A1A1A"; ctx.lineWidth = sc(1);
  ctx.beginPath(); ctx.moveTo(hx + sc(2), hy - sc(53)); ctx.lineTo(hx + sc(6), hy - sc(53)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx - sc(5), hy - sc(53)); ctx.lineTo(hx - sc(1), hy - sc(53)); ctx.stroke();
  // Mouth
  ctx.beginPath(); ctx.arc(hx + sc(2), hy - sc(46), sc(2.5), 0.1, Math.PI - 0.1); ctx.stroke();
  ctx.restore();
}

function drawStatusBanner(W, phase, idx) {
  const msgs = {
    godown_wait: "গোডাউন থেকে যাত্রা শুরু হবে...",
    moving_to_shop: `${SHOPS[idx]?.name || ""} এর দিকে যাচ্ছে`,
    truck_stop: `${SHOPS[idx]?.name || ""} এর সামনে থামল`,
    driver_exit: "ড্রাইভার ট্রাক থেকে নামছে",
    driver_to_rear: "ট্রাকের পেছনে যাচ্ছে",
    pickup_cargo: "মাল তুলছে...",
    driver_to_shop: `${SHOPS[idx]?.name || ""} এ মাল দিচ্ছে`,
    drop_cargo: "মাল রাখছে...",
    driver_return: "ট্রাকে ফিরছে...",
    all_done: "সব দোকানে মাল পৌঁছে গেছে! ✓",
  };
  const bw = Math.min(W * 0.9, sc(360));
  ctx.fillStyle = "rgba(15,36,66,0.88)";
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(W / 2 - bw / 2, sc(6), bw, sc(26), sc(5)); } else { ctx.rect(W / 2 - bw / 2, sc(6), bw, sc(26)); }
  ctx.fill();
  ctx.fillStyle = "#FFD700"; ctx.font = `bold ${sc(10)}px sans-serif`; ctx.textAlign = "center";
  ctx.fillText(msgs[phase] || "", W / 2, sc(24));
}

function drawDoneBadge(i, H) {
  const gY = H * 0.58;
  const sx = sc(SHOPS[i].x);
  ctx.fillStyle = "#27AE60"; ctx.beginPath(); ctx.arc(sx + sc(44), gY - sc(96), sc(9), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = `bold ${sc(9)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("✓", sx + sc(44), gY - sc(92));
}

function loop() {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  state.windAngle += 0.022;

  drawSky(W, H);
  drawSun(H);
  state.clouds.forEach((c) => { c.x += 0.14; if (c.x > W + 70) c.x = -70; drawCloud(c.x, H * c.yf, c.w); });
  state.birds.forEach((b) => { b.x += b.spd; if (b.x > W + 20) b.x = -20; b.wing++; drawBird(b.x, H * b.y, b.wing); });

  drawGround(W, H);
  drawGodown(H);
  [130, 540, 750].forEach((hx) => drawHouse(hx, H));
  [100, 148, 328, 388, 568, 618, 758, 810].forEach((tx) => drawTree(sc(tx), H, state.windAngle));

  drawGroceryShop(H);
  drawTeaShop(H);
  drawRestaurant(H);
  state.shopDone.forEach((done, i) => { if (done) drawDoneBadge(i, H); });

  drawTruck(state.truckX, H);
  if (state.driverVisible) drawHuman(state.driverX, H, state.driverHasCargo, state.driverGoingToShop);
  drawStatusBanner(W, state.phase, state.currentShop);

  // STATE MACHINE
  state.phaseTimer++;
  const spd = sc(2.5);

  if (state.phase === "godown_wait") {
    state.truckX = sc(-140);
    if (state.phaseTimer > 65) { state.phase = "moving_to_shop"; state.phaseTimer = 0; }

  } else if (state.phase === "moving_to_shop") {
    const target = sc(SHOPS[state.currentShop].x) - sc(28);
    state.truckX += spd;
    if (state.truckX >= target) { state.truckX = target; state.phase = "truck_stop"; state.phaseTimer = 0; }

  } else if (state.phase === "truck_stop") {
    if (state.phaseTimer > 50) {
      state.driverVisible = true;
      state.driverX = state.truckX + sc(92);
      state.driverGoingToShop = false;
      state.driverHasCargo = false;
      state.phase = "driver_exit";
      state.phaseTimer = 0;
    }

  } else if (state.phase === "driver_exit") {
    state.driverX -= sc(1.2); state.driverGoingToShop = false;
    if (state.driverX <= state.truckX + sc(75)) { state.phase = "driver_to_rear"; state.phaseTimer = 0; }

  } else if (state.phase === "driver_to_rear") {
    state.driverX -= sc(1.4); state.driverGoingToShop = false;
    if (state.driverX <= state.truckX + sc(12)) { state.driverX = state.truckX + sc(12); state.phase = "pickup_cargo"; state.phaseTimer = 0; }

  } else if (state.phase === "pickup_cargo") {
    if (state.phaseTimer > 45) { state.driverHasCargo = true; state.phase = "driver_to_shop"; state.phaseTimer = 0; }

  } else if (state.phase === "driver_to_shop") {
    const shopX = sc(SHOPS[state.currentShop].x) + sc(40);
    state.driverX += sc(1.8); state.driverGoingToShop = true;
    if (state.driverX >= shopX) { state.driverX = shopX; state.phase = "drop_cargo"; state.phaseTimer = 0; }

  } else if (state.phase === "drop_cargo") {
    if (state.phaseTimer > 55) { state.driverHasCargo = false; state.shopDone[state.currentShop] = true; state.phase = "driver_return"; state.phaseTimer = 0; }

  } else if (state.phase === "driver_return") {
    state.driverX -= sc(1.8); state.driverGoingToShop = false;
    if (state.driverX <= state.truckX + sc(88)) {
      state.driverVisible = false;
      state.currentShop++;
      state.phase = state.currentShop >= SHOPS.length ? "all_done" : "moving_to_shop";
      state.phaseTimer = 0;
    }

  } else if (state.phase === "all_done") {
    state.truckX += sc(1.5);
    if (state.truckX > W + sc(160)) {
      state.truckX = sc(-140); state.currentShop = 0;
      state.shopDone = [false, false, false]; state.driverVisible = false;
      state.phase = "godown_wait"; state.phaseTimer = 0;
    }
  }

  frame++;
  animRef.current = requestAnimationFrame(loop);
}

animRef.current = requestAnimationFrame(loop);
return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
```

}, []);

return (
<div style={{ width: “100%”, background: “#4A90C4”, borderRadius: “12px”, overflow: “hidden”, boxShadow: “0 4px 24px rgba(0,0,0,0.2)” }}>
<canvas ref={canvasRef} style={{ width: “100%”, display: “block” }} />
</div>
);
}
