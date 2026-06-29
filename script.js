const storageKey = "kewei-wheel-options-v3";
const defaultOptions = [
  { label: "\u4eca\u665a\u5403\u706b\u9505", color: "#c91f37", probability: 15 },
  { label: "\u770b\u4e00\u573a\u7535\u5f71", color: "#f06b78", probability: 15 },
  { label: "\u7ec3\u6b4c 30 \u5206\u949f", color: "#8f1728", probability: 12 },
  { label: "\u5956\u52b1\u5976\u8336", color: "#f5a0a8", probability: 15 },
  { label: "\u62cd\u4e00\u5f20\u81ea\u62cd", color: "#b72235", probability: 12 },
  { label: "\u6574\u7406\u6b4c\u5355", color: "#ffd6db", probability: 10 },
  { label: "\u4f11\u606f\u5341\u5206\u949f", color: "#7a1020", probability: 10 },
  { label: "\u968f\u673a\u821e\u53f0\u66f2", color: "#e54559", probability: 11 }
];

const canvas = document.querySelector("#wheelCanvas");
const ctx = canvas.getContext("2d");
const wheelWrap = document.querySelector(".wheel-wrap");
const optionList = document.querySelector("#optionList");
const spinButton = document.querySelector("#spinButton");
const shuffleButton = document.querySelector("#shuffleButton");
const addButton = document.querySelector("#addButton");
const saveButton = document.querySelector("#saveButton");
const saveTopButton = document.querySelector("#saveTopButton");
const resetButton = document.querySelector("#resetButton");
const resultText = document.querySelector("#resultText");
const saveState = document.querySelector("#saveState");
const probabilityTotal = document.querySelector("#probabilityTotal");
const resultDialog = document.querySelector("#resultDialog");
const dialogResult = document.querySelector("#dialogResult");
const closeDialog = document.querySelector("#closeDialog");
const spinAgainButton = document.querySelector("#spinAgainButton");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let options = loadOptions();
let rotation = 0;
let isSpinning = false;

function loadOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (Array.isArray(saved) && saved.length >= 2) return normalizeOptions(saved);
  } catch {
    localStorage.removeItem(storageKey);
  }
  return structuredClone(defaultOptions);
}

function normalizeOptions(items) {
  return items
    .map((item, index) => ({
      label: String(item.label || `\u9009\u9879 ${index + 1}`).slice(0, 14),
      color: /^#[0-9a-f]{6}$/i.test(item.color) ? item.color : defaultOptions[index % defaultOptions.length].color,
      probability: Math.max(0, Math.min(100, Number(item.probability) || 0))
    }))
    .slice(0, 12);
}

function saveOptions(message = "\u5df2\u4fdd\u5b58\u5230\u672c\u673a\u6d4f\u89c8\u5668") {
  if (!isValidTotal()) {
    updateTotalState();
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(options));
  saveState.textContent = message;
}

function totalProbability() {
  return options.reduce((sum, item) => sum + item.probability, 0);
}

function isValidTotal() {
  return Math.abs(totalProbability() - 100) < 0.001;
}

function formatPercent(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 22;
  let start = -Math.PI / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);

  options.forEach((item) => {
    const angle = (Math.PI * 2 * item.probability) / 100;
    const end = start + angle;
    const mid = start + angle / 2;
    const percent = formatPercent(item.probability);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.78)";
    ctx.lineWidth = 5;
    ctx.stroke();

    if (item.probability > 0) {
      ctx.save();
      ctx.rotate(mid);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isLightColor(item.color) ? "#5c0e1b" : "#fff";
      ctx.font = "700 23px Microsoft YaHei, Arial, sans-serif";
      drawSegmentText(item.label, `${percent}%`, radius - 30);
      ctx.restore();
    }

    start = end;
  });

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 11;
  ctx.strokeStyle = "rgba(255,255,255,0.94)";
  ctx.stroke();
  ctx.restore();
}

function drawSegmentText(text, percent, x) {
  const trimmed = text.length > 8 ? `${text.slice(0, 8)}...` : text;
  ctx.fillText(trimmed, x, -10);
  ctx.globalAlpha = 0.76;
  ctx.font = "700 15px Microsoft YaHei, Arial, sans-serif";
  ctx.fillText(percent, x, 16);
  ctx.globalAlpha = 1;
}

function isLightColor(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

function renderEditor() {
  optionList.innerHTML = "";
  options.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "option-row";
    row.innerHTML = `
      <input type="color" aria-label="\u9009\u9879\u989c\u8272" value="${item.color}" data-field="color" data-index="${index}">
      <input type="text" aria-label="\u9009\u9879\u540d\u79f0" value="${escapeAttribute(item.label)}" maxlength="14" data-field="label" data-index="${index}">
      <input type="number" aria-label="\u6982\u7387\u767e\u5206\u6bd4" title="\u76f4\u63a5\u586b\u5199\u8fd9\u4e00\u9879\u7684\u6982\u7387\uff0c\u6240\u6709\u9879\u5408\u8ba1\u9700\u8981 100%" min="0" max="100" step="0.1" value="${formatPercent(item.probability)}" data-field="probability" data-index="${index}">
      <span class="percent-badge">%</span>
      <button class="delete-button" type="button" data-delete="${index}">\u5220\u9664</button>
    `;
    optionList.append(row);
  });
  updateTotalState();
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function updateTotalState() {
  const total = totalProbability();
  const valid = isValidTotal();
  probabilityTotal.textContent = `\u6982\u7387\u5408\u8ba1 ${formatPercent(total)}%`;
  probabilityTotal.classList.toggle("invalid", !valid);
  spinButton.disabled = !valid || isSpinning;
  if (!valid) saveState.textContent = "\u6982\u7387\u5408\u8ba1\u9700\u8981\u7b49\u4e8e 100%";
}

function updateOption(event) {
  const target = event.target;
  const index = Number(target.dataset.index);
  const field = target.dataset.field;
  if (!field || Number.isNaN(index)) return;

  if (field === "probability") {
    options[index].probability = Math.max(0, Math.min(100, Number(target.value) || 0));
  } else {
    options[index][field] = field === "label" ? target.value.trim() || `\u9009\u9879 ${index + 1}` : target.value;
  }
  if (isValidTotal()) saveState.textContent = "\u6709\u672a\u4fdd\u5b58\u4fee\u6539";
  updateTotalState();
  drawWheel();
}

function deleteOption(event) {
  const index = Number(event.target.dataset.delete);
  if (Number.isNaN(index)) return;
  if (options.length <= 2) {
    saveState.textContent = "\u81f3\u5c11\u4fdd\u7559 2 \u4e2a\u9009\u9879";
    return;
  }
  options.splice(index, 1);
  render();
  saveState.textContent = "\u6709\u672a\u4fdd\u5b58\u4fee\u6539";
}

function addOption() {
  if (options.length >= 12) {
    saveState.textContent = "\u6700\u591a\u652f\u6301 12 \u4e2a\u9009\u9879";
    return;
  }
  options.push({
    label: `\u65b0\u9009\u9879 ${options.length + 1}`,
    color: defaultOptions[options.length % defaultOptions.length].color,
    probability: 0
  });
  render();
  saveState.textContent = "\u6709\u672a\u4fdd\u5b58\u4fee\u6539";
}

function pickWeightedOption() {
  let marker = Math.random() * 100;
  for (const item of options) {
    marker -= item.probability;
    if (marker <= 0) return item;
  }
  return options.at(-1);
}

function optionCenterAngle(target) {
  let start = -90;
  for (const item of options) {
    const degrees = 360 * item.probability / 100;
    if (item === target) return start + degrees / 2;
    start += degrees;
  }
  return -90;
}

function spin() {
  if (isSpinning) return;
  if (!isValidTotal()) {
    updateTotalState();
    return;
  }
  const selected = pickWeightedOption();
  const centerAngle = optionCenterAngle(selected);
  const fullSpins = 5 + Math.floor(Math.random() * 3);
  const startRotation = rotation;
  const targetRotation = rotation + fullSpins * 360 + (270 - centerAngle - (rotation % 360));
  isSpinning = true;
  spinButton.disabled = true;
  wheelWrap.classList.add("spinning");
  resultText.textContent = "\u8f6c\u52a8\u4e2d...";
  rotation = targetRotation;

  if (reduceMotion.matches) {
    canvas.style.transform = `rotate(${targetRotation}deg)`;
  } else {
    canvas.style.transition = "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    canvas.style.transform = `rotate(${startRotation - 14}deg)`;
    window.setTimeout(() => {
      canvas.style.transition = "transform 4.8s cubic-bezier(0.13, 0.78, 0.14, 1)";
      canvas.style.transform = `rotate(${targetRotation}deg)`;
    }, 190);
  }

  window.setTimeout(() => {
    isSpinning = false;
    spinButton.disabled = false;
    wheelWrap.classList.remove("spinning");
    resultText.textContent = selected.label;
    dialogResult.textContent = selected.label;
    if (typeof resultDialog.showModal === "function") resultDialog.showModal();
  }, reduceMotion.matches ? 400 : 5200);
}

function shuffleOptions() {
  options = options
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
  render();
  saveState.textContent = "\u987a\u5e8f\u5df2\u968f\u673a\u6253\u4e71";
}

function resetOptions() {
  options = structuredClone(defaultOptions);
  localStorage.removeItem(storageKey);
  resultText.textContent = "\u7b49\u5f85\u8f6c\u52a8";
  render();
  saveState.textContent = "\u5df2\u91cd\u7f6e\u9ed8\u8ba4\u6a21\u677f";
}

function render() {
  renderEditor();
  drawWheel();
  updateTotalState();
}

optionList.addEventListener("input", updateOption);
optionList.addEventListener("click", deleteOption);
spinButton.addEventListener("click", spin);
spinAgainButton.addEventListener("click", () => {
  resultDialog.close();
  spin();
});
shuffleButton.addEventListener("click", shuffleOptions);
addButton.addEventListener("click", addOption);
saveButton.addEventListener("click", () => saveOptions());
saveTopButton.addEventListener("click", () => saveOptions());
resetButton.addEventListener("click", resetOptions);
closeDialog.addEventListener("click", () => resultDialog.close());

render();
