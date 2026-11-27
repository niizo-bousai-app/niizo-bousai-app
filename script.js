// ============================================================
// はじめて編集する方へ：
// この上部の設定を書き換えると、質問・診断コメント・備蓄品を変更できます。
// 表示や画面の動きは、下の処理部分がこの設定を読み込んで自動で作ります。
// ============================================================

// 質問文、アイコン、選択肢を上から順番に設定します。
// 選択肢の value は診断結果や備蓄品の条件にも使うため、変更するときは
// 下にある「診断タイプ」「備蓄アイテム一覧」の条件も同じ値にしてください。
const QUESTIONS = [
  {
    icon: "backpack",
    title: "自宅に備蓄リュックがあり、中身を把握していますか？",
    options: [
      { label: "はい", value: "yes", icon: "task_alt" },
      { label: "いいえ", value: "no", icon: "inventory_2" },
    ],
  },
  {
    icon: "groups",
    title: "家族は何人ですか？",
    input: true,
  },
  {
    icon: "pets",
    title: "ペットはいますか？",
    options: [
      { label: "はい", value: "yes", icon: "pets" },
      { label: "いいえ", value: "no", icon: "sentiment_satisfied" },
    ],
  },
  {
    icon: "apartment",
    title: "住まいはマンション・集合住宅ですか？",
    options: [
      { label: "マンション・アパート", value: "apartment", icon: "apartment" },
      { label: "一戸建て", value: "house", icon: "home" },
    ],
  },
  {
    icon: "health_and_safety",
    title: "乳幼児・高齢者・持病のある家族はいますか？",
    options: [
      { label: "はい", value: "yes", icon: "medical_services" },
      { label: "いいえ", value: "no", icon: "favorite" },
    ],
  },
];

// 条件は上から確認され、最初に一致したタイプが診断結果になります。
// default は、上の条件に当てはまらなかった場合の結果です。
const DIAGNOSIS_TYPES = [
  {
    when: (a) => a[4] === "yes",
    type: "A",
    name: "ケア重視タイプ",
    message: "大切な人の体調を守るため、薬やケア用品をいつもの生活に合わせて準備しましょう。",
    advice: "処方薬・お薬手帳・眼鏡など、本人に欠かせないものを家族で共有しましょう。",
  },
  {
    when: (a) => a[2] === "yes" && a[3] === "apartment",
    type: "B",
    name: "ペットと在宅避難タイプ",
    message: "ペットと一緒に過ごせるよう、在宅避難と人・ペット両方の備えを整えましょう。",
    advice: "断水・停電やトイレの使用制限に備え、水と簡易トイレを多めに準備しましょう。",
  },
  {
    when: (a) => a[3] === "apartment",
    type: "C",
    name: "集合住宅・在宅避難タイプ",
    message: "災害後も自宅で過ごせるよう、水・食料に加えて簡易トイレをしっかり準備しましょう。",
    advice: "エレベーター停止や断水に備え、各階への移動を減らせる備えを考えましょう。",
  },
  {
    when: (a) => a[2] === "yes",
    type: "D",
    name: "ペットと一緒タイプ",
    message: "避難先や移動方法を家族で話し合い、ペット用品も人の備蓄と一緒に点検しましょう。",
    advice: "フード・水・トイレ用品に加え、写真やワクチン情報もまとめておくと安心です。",
  },
  {
    when: (a) => a[0] === "yes",
    type: "E",
    name: "備えを見直すタイプ",
    message: "備蓄リュックの中身を把握できていますね。家族に合わせて中身と期限を見直しましょう。",
    advice: "季節や成長に合わせて必要品を更新し、家族みんなが置き場所を知っているか確認しましょう。",
  },
  {
    type: "E",
    name: "これから備えるタイプ",
    message: "まずは水・食料・トイレから。できるものを一つずつそろえていきましょう。",
    advice: "家族で備蓄場所を決め、普段使いしながら補充するローリングストックがおすすめです。",
  },
];

// 家庭に合わせて表示する備蓄アイテムです。
// condition を省略したアイテムはすべての家庭に表示されます。
// special は優先アイテムとして目立つラベルを付けます。
const SUPPLY_ITEMS = [
  { name: "飲料水", icon: "water_drop", amount: (size) => `${size * 3 * DAYS_OF_SUPPLIES}L（1人1日3L×${DAYS_OF_SUPPLIES}日分）`, special: true },
  { name: "主食（ご飯・パンなど）", icon: "rice_bowl", amount: (size) => `${size * 3 * DAYS_OF_SUPPLIES}食（1人1日3食×${DAYS_OF_SUPPLIES}日分）`, special: true },
  { name: "おかず（缶詰・レトルトなど）", icon: "lunch_dining", amount: (size) => `${size * 3 * DAYS_OF_SUPPLIES}食分`, special: true },
  { name: "携帯トイレ（凝固剤・処理袋）", icon: "wc", amount: (size) => `${size * 5 * DAYS_OF_SUPPLIES}回分（1人1日5回×${DAYS_OF_SUPPLIES}日分）`, special: true },
  { name: "常備薬・お薬手帳", icon: "medication", amount: "必要な方の処方薬を最低7日分", condition: (a) => a[4] === "yes", special: true },
  { name: "ケア用品・使い慣れた日用品", icon: "health_and_safety", amount: "必要な方ごとに7日分", condition: (a) => a[4] === "yes" },
  { name: "ペットフード", icon: "pets", amount: "ペットごとに5〜7日分", condition: (a) => a[2] === "yes", special: true },
  { name: "ペット用飲み水", icon: "water_drop", amount: "ペットごとに5〜7日分", condition: (a) => a[2] === "yes", special: true },
  { name: "ペットシーツ・トイレ用品", icon: "crib", amount: "ペットごとに5〜7日分", condition: (a) => a[2] === "yes" },
  { name: "懐中電灯", icon: "flashlight_on", amount: "2個（すぐ使える場所に分散）" },
  { name: "予備電池", icon: "battery_charging_full", amount: "4本（懐中電灯の規格に合わせる）" },
  { name: "モバイルバッテリー", icon: "battery_charging_full", amount: (size) => `${size}台（1人1台）` },
  { name: "充電ケーブル", icon: "cable", amount: (size) => `${size}本（1人1本）` },
  { name: "ウェットティッシュ", icon: "sanitizer", amount: (size) => `${size}パック（1人1パック・30枚入りを目安）` },
  { name: "マスク", icon: "masks", amount: (size) => `${size * DAYS_OF_SUPPLIES}枚（1人1日1枚×${DAYS_OF_SUPPLIES}日分）` },
  { name: "歯ブラシ", icon: "health_and_safety", amount: (size) => `${size}本（1人1本）` },
  { name: "現金", icon: "payments", amount: (size) => `${size * 3000}円程度（1人3,000円を目安）` },
  { name: "身分証のコピー", icon: "badge", amount: (size) => `${size}人分` },
];

const DAYS_OF_SUPPLIES = 3;

const welcomeScreen = document.querySelector("#welcome-screen");
const questionScreen = document.querySelector("#question-screen");
const resultScreen = document.querySelector("#result-screen");
const questionContent = document.querySelector("#question-content");
const resultContent = document.querySelector("#result-content");
const answers = [];
let currentQuestion = 0;

function showScreen(activeScreen) {
  [welcomeScreen, questionScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== activeScreen;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
  const question = QUESTIONS[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100);
  document.querySelector("#step-label").textContent = `QUESTION ${currentQuestion + 1} / ${QUESTIONS.length}`;
  document.querySelector("#progress-percent").textContent = `${progress}%`;
  document.querySelector("#progress-fill").style.width = `${progress}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", String(currentQuestion + 1));
  document.querySelector("#back-button").setAttribute("aria-label", currentQuestion === 0 ? "スタート画面に戻る" : "前の質問に戻る");

  questionContent.innerHTML = `
    <div class="question-icon"><span class="material-symbols-outlined" aria-hidden="true">${question.icon}</span></div>
    <p class="question-kicker">QUESTION ${currentQuestion + 1}</p>
    <h2 id="question-title">${question.title}</h2>
    ${question.input ? `
      <form id="household-form" class="household-form">
        <label for="household-size">人数</label>
        <div class="household-input-row">
          <input id="household-size" name="household-size" type="number" min="1" step="1" inputmode="numeric" required value="${answers[currentQuestion] || ""}" aria-describedby="household-hint">
          <span>人</span>
          <button class="answer-button" type="submit">
            <span>次へ</span>
            <span class="material-symbols-outlined answer-arrow" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
        <p id="household-hint" class="household-hint">一緒に備えるご家族の人数を入力してください。</p>
      </form>
    ` : `
      <div class="answer-options" role="group" aria-labelledby="question-title">
        ${question.options.map((option) => `
          <button class="answer-button" type="button" data-value="${option.value}">
            <span class="material-symbols-outlined" aria-hidden="true">${option.icon}</span>
            <span>${option.label}</span>
            <span class="material-symbols-outlined answer-arrow" aria-hidden="true">arrow_forward</span>
          </button>
        `).join("")}
      </div>
    `}
  `;
  if (question.input) {
    const form = questionContent.querySelector("#household-form");
    const input = form.querySelector("#household-size");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!input.reportValidity()) return;
      const size = input.valueAsNumber;
      if (!Number.isSafeInteger(size)) {
        input.setCustomValidity("1人以上の整数を入力してください。");
        input.reportValidity();
        return;
      }
      selectAnswer(size);
    });
    input.addEventListener("input", () => input.setCustomValidity(""));
  } else {
    questionContent.querySelectorAll(".answer-button").forEach((button) => {
      button.addEventListener("click", () => selectAnswer(button.dataset.value));
    });
  }
}

function selectAnswer(value) {
  answers[currentQuestion] = value;
  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion += 1;
    renderQuestion();
    questionContent.classList.remove("question-transition");
    requestAnimationFrame(() => questionContent.classList.add("question-transition"));
    return;
  }
  renderResult();
  showScreen(resultScreen);
}

function getDiagnosis() {
  return DIAGNOSIS_TYPES.find((entry) => !entry.when || entry.when(answers));
}

function renderResult() {
  const diagnosis = getDiagnosis();
  const householdSize = answers[1];
  const waterLitres = householdSize * 3 * DAYS_OF_SUPPLIES;
  const mealCount = householdSize * 3 * DAYS_OF_SUPPLIES;
  const displayedItems = SUPPLY_ITEMS.filter((item) => !item.condition || item.condition(answers));

  resultContent.innerHTML = `
    <div class="result-hero">
      <div>
        <div class="eyebrow"><span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>YOUR FAMILY'S PLAN</div>
        <h1 id="result-title">${diagnosis.name}</h1>
        <p>${diagnosis.message}</p>
      </div>
      <div class="type-badge" aria-label="${diagnosis.type}タイプ">
        <strong>${diagnosis.type}</strong><span>TYPE</span>
      </div>
    </div>
    <div class="result-grid">
      <section class="result-card needs-card" aria-labelledby="needs-title">
        <div class="card-heading">
          <span class="card-heading-icon material-symbols-outlined" aria-hidden="true">priority_high</span>
          <h2 id="needs-title">まずは3日分の目安</h2>
        </div>
        <p class="needs-intro">ご家族${householdSize}人分の最低限の目安です。</p>
        <div class="need-quantity">
          <span class="need-label">飲料水</span>
          <strong class="need-value">${waterLitres} L</strong>
          <div class="need-caption">${householdSize}人 × 1日3L × ${DAYS_OF_SUPPLIES}日分</div>
        </div>
        <div class="need-quantity">
          <span class="need-label">食料</span>
          <strong class="need-value">${mealCount}食分以上</strong>
          <div class="need-caption">${householdSize}人 × 1日3食 × ${DAYS_OF_SUPPLIES}日分</div>
        </div>
      </section>
      <section class="result-card" aria-labelledby="advice-title">
        <div class="card-heading">
          <span class="card-heading-icon material-symbols-outlined" aria-hidden="true">lightbulb</span>
          <h2 id="advice-title">わが家へのアドバイス</h2>
        </div>
        <div class="advice-list">
          <div class="advice-item"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span><span>${diagnosis.advice}</span></div>
          ${answers[2] === "yes" ? '<div class="advice-item"><span class="material-symbols-outlined" aria-hidden="true">pets</span><span>避難先のペット受け入れ条件や移動方法も、事前に確認しましょう。</span></div>' : ""}
          ${answers[3] === "apartment" ? '<div class="advice-item"><span class="material-symbols-outlined" aria-hidden="true">apartment</span><span>断水や排水管の被害に備えて、簡易トイレを優先して準備しましょう。</span></div>' : ""}
          ${answers[4] === "yes" ? '<div class="advice-item"><span class="material-symbols-outlined" aria-hidden="true">medical_services</span><span>常備薬・ケア用品は切らさないよう、少し多めに備えましょう。</span></div>' : ""}
        </div>
      </section>
      <section class="result-card checklist-card" aria-labelledby="checklist-title">
        <div class="card-heading">
          <span class="card-heading-icon material-symbols-outlined" aria-hidden="true">checklist</span>
          <h2 id="checklist-title">わが家の必要備蓄チェックリスト</h2>
        </div>
        <p class="checklist-intro">準備できているものにチェック。数量は目安です。持病・季節・地域に合わせて調整してください。</p>
        <div class="checklist-progress">
          <div class="checklist-progress-label"><span>準備の進み具合</span><strong id="checklist-progress-text">0 / ${displayedItems.length} 項目</strong></div>
          <div id="checklist-progress-bar" class="checklist-progress-track" role="progressbar" aria-label="備蓄品の準備状況" aria-valuemin="0" aria-valuemax="${displayedItems.length}" aria-valuenow="0"><span></span></div>
        </div>
        <div class="checklist">
          ${displayedItems.map((item) => `
            <label class="supply-item">
              <input type="checkbox" aria-label="${item.name}を準備できている">
              <span class="check-visual"><span class="material-symbols-outlined" aria-hidden="true">check</span></span>
              <span class="material-symbols-outlined supply-icon" aria-hidden="true">${item.icon}</span>
              <span class="supply-copy"><span class="supply-name">${item.name}</span><span class="supply-amount">${typeof item.amount === "function" ? item.amount(householdSize) : item.amount}</span></span>
              ${item.special ? '<span class="priority-tag">優先</span>' : ""}
            </label>
          `).join("")}
        </div>
      </section>
    </div>
    <div class="result-actions">
      <button id="image-share-button" class="button button-large" type="button"><span class="material-symbols-outlined" aria-hidden="true">image</span>結果画像をシェア</button>
      <button id="image-download-button" class="button button-secondary" type="button"><span class="material-symbols-outlined" aria-hidden="true">download</span>画像を保存</button>
      <button id="text-share-button" class="button button-secondary" type="button"><span class="material-symbols-outlined" aria-hidden="true">share</span>テキストで共有</button>
      <button id="restart-button" class="button button-secondary" type="button"><span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>もう一度診断する</button>
    </div>
    <p id="share-status" class="copy-status" role="status" aria-live="polite"></p>
  `;
  resultContent.querySelectorAll('.supply-item input').forEach((input) => {
    input.addEventListener("change", updateChecklistProgress);
  });
  updateChecklistProgress();
  document.querySelector("#image-share-button").addEventListener("click", shareImageResult);
  document.querySelector("#image-download-button").addEventListener("click", downloadResultImage);
  document.querySelector("#text-share-button").addEventListener("click", shareTextResult);
  document.querySelector("#restart-button").addEventListener("click", restart);
}

function updateChecklistProgress() {
  const checkboxes = [...resultContent.querySelectorAll(".supply-item input")];
  const checkedCount = checkboxes.filter((input) => input.checked).length;
  const progressBar = resultContent.querySelector("#checklist-progress-bar");
  resultContent.querySelector("#checklist-progress-text").textContent = `${checkedCount} / ${checkboxes.length} 項目`;
  progressBar.setAttribute("aria-valuenow", String(checkedCount));
  progressBar.querySelector("span").style.width = `${checkboxes.length ? (checkedCount / checkboxes.length) * 100 : 0}%`;
}

function getShareText(includeUrl = false) {
  const diagnosis = getDiagnosis();
  const householdSize = answers[1];
  const checklist = getChecklistItems().map((item) =>
    `${item.checked ? "☑" : "☐"} ${item.name}：${item.amount}`);
  return [
    "【わが家の備蓄点検】",
    `${diagnosis.name}（${diagnosis.type}タイプ）`,
    `水：${householdSize * 3 * DAYS_OF_SUPPLIES}L以上（1人1日3L×${DAYS_OF_SUPPLIES}日分）`,
    `食料：${householdSize * 3 * DAYS_OF_SUPPLIES}食分以上（1人1日3食×${DAYS_OF_SUPPLIES}日分）`,
    "",
    "備蓄チェックリスト：",
    ...checklist,
    "",
    diagnosis.advice,
    includeUrl ? `\nアプリ：${location.href}` : "",
  ].filter(Boolean).join("\n");
}

async function copyResult(status, text, shareFallback = false) {
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      try {
        textArea.select();
        copied = document.execCommand("copy");
      } finally {
        textArea.remove();
      }
    } catch {
      copied = false;
    }
  }
  status.textContent = copied
    ? "結果をコピーしました。家族に送って共有しましょう！"
    : shareFallback
      ? "共有・コピーができませんでした。ブラウザーの設定をご確認ください。"
      : "コピーできませんでした。もう一度お試しください。";
}

function getChecklistItems() {
  return [...resultContent.querySelectorAll(".supply-item")].map((item) => ({
    name: item.querySelector(".supply-name").textContent,
    amount: item.querySelector(".supply-amount").textContent,
    checked: item.querySelector("input").checked,
    special: Boolean(item.querySelector(".priority-tag")),
  }));
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const lines = [];
  let line = "";
  for (const character of Array.from(text)) {
    const candidate = line + character;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = character;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    let lastLine = visibleLines[maxLines - 1];
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) {
      lastLine = Array.from(lastLine).slice(0, -1).join("");
    }
    visibleLines[maxLines - 1] = `${lastLine}…`;
  }
  visibleLines.forEach((textLine, index) => context.fillText(textLine, x, y + index * lineHeight));
  return y + visibleLines.length * lineHeight;
}

async function createResultImage() {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  const diagnosis = getDiagnosis();
  const householdSize = answers[1];
  const items = getChecklistItems();
  const checkedCount = items.filter((item) => item.checked).length;
  const columns = 2;
  const rows = Math.ceil(items.length / columns);
  const width = 1080;
  const padding = 64;
  const rowHeight = 126;
  const checklistTop = 700;
  const adviceTop = checklistTop + rows * rowHeight + 30;
  const height = adviceTop + 300;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("画像を作成できませんでした。");

  context.fillStyle = "#f3f8f5";
  context.fillRect(0, 0, width, height);
  const headerGradient = context.createLinearGradient(0, 0, width, 330);
  headerGradient.addColorStop(0, "#00554d");
  headerGradient.addColorStop(1, "#168c78");
  context.fillStyle = headerGradient;
  context.fillRect(0, 0, width, 330);
  context.fillStyle = "rgba(255,255,255,.07)";
  context.beginPath();
  context.arc(970, 32, 190, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(880, 310, 115, 0, Math.PI * 2);
  context.fill();

  context.textBaseline = "top";
  context.fillStyle = "#b8eee0";
  context.font = '700 22px "Noto Sans JP", sans-serif';
  context.fillText("にいぞ防災  |  わが家の備蓄点検", padding, 54);
  context.fillStyle = "#ffffff";
  context.font = '800 48px "Noto Sans JP", sans-serif';
  context.fillText("わが家の備蓄プラン", padding, 112);
  context.fillStyle = "#e0f4ee";
  context.font = '500 25px "Noto Sans JP", sans-serif';
  context.fillText(`${householdSize}人家族  ・  ${diagnosis.name}`, padding, 185);
  context.font = '400 20px "Noto Sans JP", sans-serif';
  drawWrappedText(context, diagnosis.message, padding, 235, 810, 31, 2);
  roundedRect(context, 914, 109, 102, 102, 28);
  context.fillStyle = "rgba(255,255,255,.16)";
  context.fill();
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.font = '800 54px "Plus Jakarta Sans", sans-serif';
  context.fillText(diagnosis.type, 965, 123);
  context.font = '700 15px "Noto Sans JP", sans-serif';
  context.fillText("タイプ", 965, 183);
  context.textAlign = "left";

  roundedRect(context, padding, 365, width - padding * 2, 230, 28);
  context.fillStyle = "#ffffff";
  context.fill();
  context.fillStyle = "#647773";
  context.font = '700 20px "Noto Sans JP", sans-serif';
  context.fillText(`${DAYS_OF_SUPPLIES}日分の備蓄目安`, padding + 34, 394);
  context.strokeStyle = "#e3ece7";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(width / 2, 438);
  context.lineTo(width / 2, 560);
  context.stroke();
  const stats = [
    { x: padding + 34, label: "飲料水", value: `${householdSize * 3 * DAYS_OF_SUPPLIES} L`, detail: "1人1日3Lを目安" },
    { x: width / 2 + 34, label: "食料", value: `${householdSize * 3 * DAYS_OF_SUPPLIES} 食以上`, detail: "1人1日3食を目安" },
  ];
  for (const stat of stats) {
    context.fillStyle = "#647773";
    context.font = '600 19px "Noto Sans JP", sans-serif';
    context.fillText(stat.label, stat.x, 449);
    context.fillStyle = "#75420f";
    context.font = '800 39px "Noto Sans JP", sans-serif';
    context.fillText(stat.value, stat.x, 481);
    context.fillStyle = "#806b52";
    context.font = '400 16px "Noto Sans JP", sans-serif';
    context.fillText(stat.detail, stat.x, 536);
  }

  context.fillStyle = "#172d2a";
  context.font = '800 27px "Noto Sans JP", sans-serif';
  context.fillText("備蓄チェックリスト", padding, 632);
  context.textAlign = "right";
  context.fillStyle = "#006a60";
  context.font = '700 18px "Noto Sans JP", sans-serif';
  context.fillText(`${checkedCount} / ${items.length} 項目を準備済み`, width - padding, 638);
  context.textAlign = "left";
  roundedRect(context, padding, 674, width - padding * 2, 8, 4);
  context.fillStyle = "#dce7e2";
  context.fill();
  if (checkedCount) {
    roundedRect(context, padding, 674, (width - padding * 2) * (checkedCount / items.length), 8, 4);
    context.fillStyle = "#168c78";
    context.fill();
  }

  const gap = 16;
  const cardWidth = (width - padding * 2 - gap) / 2;
  items.forEach((item, index) => {
    const column = Math.floor(index / rows);
    const row = index % rows;
    const x = padding + column * (cardWidth + gap);
    const y = checklistTop + row * rowHeight;
    roundedRect(context, x, y, cardWidth, 110, 18);
    context.fillStyle = item.checked ? "#e8f6ef" : "#ffffff";
    context.fill();
    context.strokeStyle = item.checked ? "#b6dfd1" : "#dce7e2";
    context.lineWidth = 2;
    context.stroke();
    roundedRect(context, x + 17, y + 20, 28, 28, 8);
    context.fillStyle = item.checked ? "#006a60" : "#ffffff";
    context.fill();
    context.strokeStyle = item.checked ? "#006a60" : "#b5c8c0";
    context.stroke();
    if (item.checked) {
      context.strokeStyle = "#ffffff";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(x + 24, y + 34);
      context.lineTo(x + 29, y + 39);
      context.lineTo(x + 39, y + 27);
      context.stroke();
    }
    context.textAlign = "right";
    context.fillStyle = item.special ? "#a55318" : "#647773";
    context.font = '700 13px "Noto Sans JP", sans-serif';
    if (item.special) context.fillText("優先", x + cardWidth - 16, y + 18);
    context.textAlign = "left";
    context.fillStyle = item.checked ? "#647773" : "#172d2a";
    context.font = '700 17px "Noto Sans JP", sans-serif';
    drawWrappedText(context, item.name, x + 56, y + 20, cardWidth - 78, 23, 2);
    context.fillStyle = "#647773";
    context.font = '400 14px "Noto Sans JP", sans-serif';
    drawWrappedText(context, item.amount, x + 56, y + 68, cardWidth - 74, 19, 2);
  });

  roundedRect(context, padding, adviceTop, width - padding * 2, 116, 22);
  context.fillStyle = "#e2f2eb";
  context.fill();
  context.fillStyle = "#006a60";
  context.font = '800 18px "Noto Sans JP", sans-serif';
  context.fillText("わが家へのアドバイス", padding + 24, adviceTop + 19);
  context.fillStyle = "#435b55";
  context.font = '500 16px "Noto Sans JP", sans-serif';
  drawWrappedText(context, diagnosis.advice, padding + 24, adviceTop + 51, width - padding * 2 - 48, 24, 2);

  context.fillStyle = "#647773";
  context.font = '400 14px "Noto Sans JP", sans-serif';
  context.fillText("数量は目安です。持病・季節・地域に合わせて調整してください。", padding, adviceTop + 143);
  context.fillStyle = "#006a60";
  context.font = '600 14px "Noto Sans JP", sans-serif';
  drawWrappedText(context, location.href, padding, adviceTop + 173, width - padding * 2, 20, 2);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("画像データを作成できませんでした。"));
    }, "image/png");
  });
  return blob;
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wagaya-bichiku-plan.png";
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

async function downloadResultImage() {
  const status = document.querySelector("#share-status");
  status.textContent = "結果画像を作成しています…";
  try {
    downloadBlob(await createResultImage());
    status.textContent = "結果画像を保存しました。";
  } catch {
    status.textContent = "画像を作成できませんでした。もう一度お試しください。";
  }
}

async function shareImageResult() {
  const status = document.querySelector("#share-status");
  let blob;
  status.textContent = "結果画像を作成しています…";
  try {
    blob = await createResultImage();
    if (typeof File === "function" && typeof navigator.share === "function") {
      const file = new File([blob], "wagaya-bichiku-plan.png", { type: "image/png" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "わが家の備蓄点検", text: "わが家の備蓄点検結果です。" });
        status.textContent = "結果画像を共有しました。";
        return;
      }
    }
    downloadBlob(blob);
    status.textContent = "この端末は画像共有に対応していないため、画像を保存しました。保存した画像を共有してください。";
  } catch (error) {
    if (error && error.name === "AbortError") {
      status.textContent = "画像の共有をキャンセルしました。";
      return;
    }
    if (blob) {
      try {
        downloadBlob(blob);
        status.textContent = "画像共有に失敗したため、結果画像を保存しました。";
        return;
      } catch {
        status.textContent = "画像を共有・保存できませんでした。もう一度お試しください。";
        return;
      }
    }
    status.textContent = "画像を作成できませんでした。もう一度お試しください。";
  }
}

async function shareTextResult() {
  const status = document.querySelector("#share-status");
  const shareText = getShareText();
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "わが家の備蓄点検", text: shareText, url: location.href });
      status.textContent = "結果を共有しました。";
      return;
    } catch (error) {
      if (error && error.name === "AbortError") {
        status.textContent = "共有をキャンセルしました。";
        return;
      }
    }
  }
  await copyResult(status, getShareText(true), true);
}

function restart() {
  answers.length = 0;
  currentQuestion = 0;
  renderQuestion();
  showScreen(welcomeScreen);
}

document.querySelector("#start-button").addEventListener("click", () => {
  answers.length = 0;
  currentQuestion = 0;
  renderQuestion();
  showScreen(questionScreen);
});

document.querySelector("#back-button").addEventListener("click", () => {
  if (currentQuestion === 0) {
    showScreen(welcomeScreen);
    return;
  }
  currentQuestion -= 1;
  renderQuestion();
});
