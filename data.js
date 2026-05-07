// Bilingual content for the AOSP visualization
window.AOSP_DATA = {
  hero: {
    kicker: { zh: "互動式視覺化", en: "Interactive visualization" },
    title: {
      zh: ["從 ", "Build ID", " 到 ", "燒錄", " 的全流程"],
      en: ["From ", "Build ID", " to ", "Flash", " — the full workflow"]
    },
    sub: {
      zh: "一張圖看懂 Pixel 8 AOSP 編譯與燒錄。點擊每一個階段觀察狀態轉換、指令、產物，以及哪些步驟交給 AI、哪些必須留給人。",
      en: "One diagram for the entire Pixel 8 AOSP build & flash. Click any stage to see state transitions, commands, artefacts — and which steps belong to the AI vs the human."
    },
    chips: {
      zh: ["Pixel 8 (shiba)", "Android 16 / BP4A", "userdebug", "Agentic AI Skill"],
      en: ["Pixel 8 (shiba)", "Android 16 / BP4A", "userdebug", "Agentic AI Skill"]
    },
    stats: [
      { num: "30–90m", lbl: { zh: "repo sync", en: "repo sync" } },
      { num: "1–3h", lbl: { zh: "首次編譯", en: "first build" } },
      { num: "~70s", lbl: { zh: "fastboot 燒錄", en: "fastboot flash" } },
      { num: "5–10m", lbl: { zh: "首次開機", en: "first boot" } },
    ],
  },

  alignment: {
    head: { zh: "三個版本必須對齊", en: "Three versions must align" },
    sub: {
      zh: "手機 Build ID、AOSP source tag、Vendor driver — 任何一個對不齊都會無法開機或編譯失敗。",
      en: "Phone Build ID, AOSP source tag, and Vendor driver — any mismatch means boot loop or build error."
    },
    tracks: [
      {
        key: "build",
        label: { zh: "1 · 手機目前", en: "1 · From phone" },
        title: { zh: "Build ID", en: "Build ID" },
        icon: "📱",
        color: "var(--accent-4)",
        valueOk: "BP4A.251205.006",
        valueBad: "BP4A.251205.006",
        src: { zh: "adb shell getprop ro.build.id", en: "adb shell getprop ro.build.id" }
      },
      {
        key: "aosp",
        label: { zh: "2 · 查表得到", en: "2 · Look up" },
        title: { zh: "AOSP Tag", en: "AOSP Tag" },
        icon: "🌳",
        color: "var(--accent-2)",
        valueOk: "android-16.0.0_rXX",
        valueBad: "android-15.0.0_r34",
        src: { zh: "source.android.com/.../build-numbers", en: "source.android.com/.../build-numbers" }
      },
      {
        key: "vendor",
        label: { zh: "3 · 對應驅動", en: "3 · Matching driver" },
        title: { zh: "Vendor Driver", en: "Vendor Driver" },
        icon: "🔧",
        color: "var(--accent-3)",
        valueOk: "shiba-bp4a.251205.006-...tgz",
        valueBad: "shiba-bp1a.250505.005.b1-...tgz",
        src: { zh: "developers.google.com/android/drivers", en: "developers.google.com/android/drivers" }
      }
    ],
    okMsg: { zh: "三個版本對齊 — 可以繼續 build", en: "All three aligned — safe to build" },
    badMsg: { zh: "版本對不齊 — bootloop / 編譯失敗的根源", en: "Mismatch — root cause of bootloops / build errors" },
    why: [
      { zh: "AOSP 比 vendor 新 → 找不到對應 module/API", en: "AOSP newer than vendor → missing module/API" },
      { zh: "AOSP 比 vendor 舊 → blob 用到還沒有的 framework", en: "AOSP older than vendor → blob calls future framework" },
      { zh: "bootloader / radio 對不上 → 燒進去開不了機", en: "bootloader / radio off → device won't boot" },
    ]
  },

  pipeline: [
    {
      id: "buildid",
      icon: "🔍",
      time: "10s",
      assignee: "ai",
      name: { zh: "讀取 Build ID", en: "Read Build ID" },
      desc: {
        zh: "從手機抓出目前的 Build ID。整條 pipeline 唯一的人類輸入。",
        en: "Pull the current Build ID off the phone. The single human input to the whole pipeline."
      },
      cmd: `<span class="c"># Read build identifier from device</span>
<span class="k">adb</span> shell getprop ro.build.id
<span class="ok">BP4A.251205.006</span>

<span class="k">adb</span> shell getprop ro.build.fingerprint
<span class="ok">google/shiba/shiba:16/<span class="v">BP4A.251205.006</span>/.../user/release-keys</span>`,
      tip: {
        zh: "Build ID 格式：B(主版本) P 4A(分支) .251205(分支日期) .006(patch)。分支代號小寫即為 lunch 的 release config。",
        en: "Format: B (major) · P · 4A (branch) · .251205 (branch date) · .006 (patch). Lowercase branch code = lunch release config."
      }
    },
    {
      id: "lookup",
      icon: "📚",
      time: "30s",
      assignee: "ai",
      name: { zh: "查表對齊", en: "Look up & align" },
      desc: {
        zh: "用 Build ID 同時查 AOSP source tag 與 vendor driver URL，確認三者一致。",
        en: "Use the Build ID to look up the AOSP source tag and vendor driver URL, then confirm all three line up."
      },
      cmd: `<span class="c"># 1. AOSP tag table</span>
source.android.com/docs/setup/reference/build-numbers
<span class="ok">→ Tag: android-16.0.0_rXX
  Branch: android16-qpr2-release</span>

<span class="c"># 2. Vendor driver page</span>
developers.google.com/android/drivers
<span class="ok">→ google_devices-shiba-bp4a.251205.006-*.tgz
  SHA-256: ef15dd6d...</span>`,
      tip: {
        zh: "AI 處理：自動查表 + 驗證對齊。人介入：tag 不存在時，需要人決定退到哪個更早的 Build ID。",
        en: "AI: lookup + alignment check. Human: pick a fallback Build ID when no matching tag exists yet."
      }
    },
    {
      id: "sync",
      icon: "📥",
      time: "30–90m",
      assignee: "ai",
      name: { zh: "repo init / sync", en: "repo init / sync" },
      desc: {
        zh: "下載 AOSP 原始碼樹（約 100GB+）。網路中斷可斷點續傳。",
        en: "Download the AOSP source tree (~100GB+). Resumable on network interruption."
      },
      cmd: `<span class="k">repo</span> init \\
  --partial-clone \\
  --no-use-superproject \\
  -b <span class="v">android-16.0.0_rXX</span> \\
  -u https://android.googlesource.com/platform/manifest

<span class="k">repo</span> sync -c -j8 2>&amp;1 | tee repo_sync.log
<span class="c"># -c: current branch only (~50% smaller)
# -j8: 8 parallel — don't $(nproc), 503s</span>`,
      tip: {
        zh: "AI 處理：撞 503 自動降低並行數重試；中斷自動續傳。整段最不需要人。",
        en: "AI: auto-throttle parallelism on 503, auto-resume on disconnect. The least human-needed step."
      }
    },
    {
      id: "vendor",
      icon: "🔧",
      time: "5m",
      assignee: "ai",
      name: { zh: "Vendor blob", en: "Vendor blob" },
      desc: {
        zh: "下載 → SHA-256 驗證 → 解壓 → 自動同意授權 → 確認關鍵檔案存在。",
        en: "Download → SHA-256 verify → extract → auto-accept license → confirm key file exists."
      },
      cmd: `<span class="k">wget</span> '&lt;url&gt;'
<span class="k">sha256sum</span> google_devices-shiba-*.tgz
<span class="ok">ef15dd6d...  ✓ matches</span>

<span class="k">tar</span> -xzf google_devices-shiba-*.tgz
<span class="c"># auto-accept license (Enter + I ACCEPT)</span>
printf '\\nI ACCEPT\\n' | bash extract-google_devices-shiba.sh

<span class="k">ls</span> vendor/google_devices/shiba/proprietary/<span class="v">device-vendor.mk</span>
<span class="ok">→ exists ✓</span>`,
      tip: {
        zh: "⚠️ device-vendor.mk 不存在但 build 仍會成功，燒進去後手機卡 bootloop。AI 必須驗證這個檔案存在再繼續。",
        en: "⚠️ Without device-vendor.mk the build still succeeds but the phone boot-loops. AI must verify this file exists before proceeding."
      }
    },
    {
      id: "build",
      icon: "🏗️",
      time: "1–3h",
      assignee: "ai",
      name: { zh: "lunch + m", en: "lunch + m" },
      desc: {
        zh: "設定 lunch target 並編譯整個 system image。Android 14+ 必須三段式 lunch。",
        en: "Pick the lunch target and compile the system image. Android 14+ requires the three-segment form."
      },
      cmd: `<span class="k">source</span> build/envsetup.sh
<span class="k">lunch</span> aosp_shiba-<span class="v">bp4a</span>-userdebug
<span class="c">#              ^^^^ release config = build ID prefix lowercase</span>

<span class="ok">TARGET_PRODUCT=aosp_shiba
TARGET_BUILD_VARIANT=userdebug
TARGET_ARCH=arm64</span>

<span class="k">m</span>
<span class="ok">#### build completed successfully (HH:MM:SS) ####</span>`,
      tip: {
        zh: "舊格式 `lunch aosp_shiba-userdebug` 在 Android 14+ 會直接報 Invalid lunch combo。",
        en: "The old `lunch aosp_shiba-userdebug` form fails on Android 14+ with Invalid lunch combo."
      }
    },
    {
      id: "unlock",
      icon: "🔓",
      time: "60s",
      assignee: "human",
      name: { zh: "解鎖 bootloader", en: "Unlock bootloader" },
      desc: {
        zh: "第一次燒 AOSP 必須。會清除 userdata — 不可逆，必須人類在手機螢幕上實體確認。",
        en: "Required for the first AOSP flash. Wipes userdata — irreversible, requires the human to confirm on the device screen."
      },
      cmd: `<span class="k">adb</span> reboot bootloader
<span class="k">fastboot</span> getvar unlocked
<span class="ok">unlocked: yes</span>   <span class="c"># or: no → unlock now</span>

<span class="k">fastboot</span> flashing unlock
<span class="c"># Phone screen:
#   ▶ Unlock the bootloader   ← Volume keys
#   Power = confirm
#   ⚠️ This will wipe all userdata</span>`,
      tip: {
        zh: "🚧 Human-only：AI 永遠不自動執行可逆性 = 0 的操作。要求人確認後再繼續。",
        en: "🚧 Human-only: AI never auto-runs zero-reversibility operations. Pauses for explicit confirmation."
      },
      warn: true
    },
    {
      id: "flash",
      icon: "⚡",
      time: "70s",
      assignee: "ai",
      name: { zh: "fastboot flashall", en: "fastboot flashall" },
      desc: {
        zh: "把所有 .img 燒進手機。會自動切換 A/B slot。日常迭代不加 -w 保留資料。",
        en: "Push every .img to the device. Auto-switches A/B slots. Drop -w during dev to keep userdata."
      },
      cmd: `<span class="k">cd</span> $(get_build_var PRODUCT_OUT)
<span class="k">fastboot</span> flashall <span class="v">-w</span>   <span class="c"># -w wipes userdata</span>

<span class="ok">Setting current slot to 'b'         OKAY
Sending 'boot_b' (65536 KB)         OKAY
Writing 'boot_b'                    OKAY
Sending sparse 'super' 1/10 ...     OKAY
Erasing 'userdata'                  OKAY
Finished. Total time: ~70s</span>

<span class="c"># ⚠️ Don't add --disable-verity on Pixel 8+
# fastboot: error: Failed to find AVB_MAGIC</span>`,
      tip: {
        zh: "看起來像錯誤但其實正常：「File system type raw not supported」「wipe task partition not found: cache」— Pixel 8 用 A/B + dynamic partition，沒獨立 cache。",
        en: "Looks like errors but isn't: \"raw not supported\" / \"cache not found\" — Pixel 8 has no dedicated cache; format runs on first boot."
      }
    }
  ],

  human_ai: {
    head: { zh: "Human-in-the-Loop 邊界", en: "The Human-in-the-Loop boundary" },
    sub: {
      zh: "整套 architecture 最重要的設計決策：什麼交給 AI、什麼留給人？關鍵原則是「不可逆 + 需要上下文判斷」一律暫停等人。",
      en: "The single most important design decision: what to delegate, what to reserve. Anything irreversible OR requiring context judgement must pause for the human."
    },
    ai: {
      title: { zh: "交給 AI", en: "Delegated to AI" },
      role: { zh: "EXECUTOR", en: "EXECUTOR" },
      items: [
        { ico: "🔄", zh: "repo sync / build / flash 的執行", en: "Running repo sync / build / flash" },
        { ico: "🔐", zh: "SHA-256 驗證", en: "SHA-256 verification" },
        { ico: "🔁", zh: "可預期錯誤的重試（網路 / 503）", en: "Predictable error retries (network / 503)" },
        { ico: "📊", zh: "進度記錄與通知", en: "Progress tracking & notifications" },
        { ico: "🧪", zh: "vendor 結構驗證 (device-vendor.mk)", en: "Vendor structure check (device-vendor.mk)" },
      ]
    },
    human: {
      title: { zh: "留給人", en: "Reserved for human" },
      role: { zh: "SUPERVISOR", en: "SUPERVISOR" },
      items: [
        { ico: "🔓", zh: "Bootloader unlock（會清資料）", en: "Bootloader unlock (wipes data)" },
        { ico: "🎯", zh: "找不到對應 tag 時的版本決策", en: "Version-fallback decisions when no tag matches" },
        { ico: "🐛", zh: "非預期的編譯錯誤分析", en: "Analysis of unexpected build errors" },
        { ico: "🩺", zh: "硬體異常診斷", en: "Hardware anomaly diagnosis" },
        { ico: "🧱", zh: "變磚 → 救磚決策", en: "Brick recovery decisions" },
      ]
    }
  },

  shift: {
    head: { zh: "心智模式的轉變", en: "The mental shift" },
    sub: {
      zh: "Agentic AI 帶來的最大改變不是「速度變快」，而是「同時持有多個 project 狀態」。",
      en: "The biggest change isn't speed — it's being able to hold the state of multiple projects in parallel."
    },
    before: {
      title: { zh: "以前", en: "Before" },
      role: { zh: "EXECUTOR", en: "EXECUTOR" },
      desc: {
        zh: "一次只能專注一個 build，等待期間注意力碎片化。",
        en: "One build at a time. Attention fragments during waits."
      },
      timelines: [
        { name: "Project A", segs: [["seg-build", 18, "build"], ["seg-wait", 35, "wait…"], ["seg-flash", 8, "flash"], ["seg-test", 14, "verify"], ["seg-think", 25, ""]] }
      ]
    },
    after: {
      title: { zh: "以後", en: "After" },
      role: { zh: "SUPERVISOR", en: "SUPERVISOR" },
      desc: {
        zh: "三條 pipeline 並行跑，工程師只在「例外」介入。",
        en: "Three pipelines in parallel; engineer only intervenes on exceptions."
      },
      timelines: [
        { name: "Project A", segs: [["seg-ai", 60, "AI ▶ build/flash"], ["seg-think", 14, "human"], ["seg-ai", 26, "AI ▶ verify"]] },
        { name: "Project B", segs: [["seg-ai", 30, "AI"], ["seg-think", 10, "🧠"], ["seg-ai", 60, "AI ▶ build/flash"]] },
        { name: "Project C", segs: [["seg-ai", 15, "AI"], ["seg-think", 8, "🧠"], ["seg-ai", 50, "AI"], ["seg-think", 6, "🧠"], ["seg-ai", 21, "AI"]] }
      ]
    }
  },

  slots: {
    head: { zh: "A/B Slot 與 Dynamic Partition", en: "A/B slots & dynamic partitions" },
    sub: {
      zh: "Pixel 8 的內建 fail-safe — 一個 slot 壞了還能切回另一個。fastboot flashall 每次自動切換。",
      en: "Pixel 8's built-in fail-safe — if one slot is broken, the other still boots. flashall auto-switches each time."
    },
    partitions: [
      { name: "boot", a: true, b: false },
      { name: "system", a: true, b: false },
      { name: "vendor", a: true, b: false },
      { name: "vbmeta", a: true, b: false },
      { name: "super", a: true, b: false },
      { name: "userdata", shared: true },
    ],
    explain: [
      { zh: "燒錄目標永遠是「非當前」slot — 失敗了還能切回", en: "Always flashes the inactive slot — failure can fall back" },
      { zh: "Pixel 8 用 dynamic partition (super)，沒有獨立 cache 分區", en: "Pixel 8 uses dynamic partitions (super); no separate cache" },
      { zh: "userdata 為兩 slot 共用 — 所以 -w 會清掉所有東西", en: "userdata is shared between slots — that's why -w wipes everything" },
    ]
  },

  errors: {
    head: { zh: "常見錯誤與救磚", en: "Common errors & recovery" },
    items: [
      {
        tag: "lunch",
        msg: "Invalid lunch combo: aosp_shiba-userdebug",
        cause: { zh: "Android 14+ 改三段式", en: "Android 14+ uses three segments" },
        fix: `<span class="k">lunch</span> aosp_shiba-<span class="v">bp4a</span>-userdebug`
      },
      {
        tag: "boot",
        msg: { zh: "刷完開機循環 → 回 fastboot", en: "Flash → bootloop → back to fastboot" },
        cause: { zh: "vendor blob 缺失（多半是 extract 失敗）", en: "Missing vendor blob (extract failed)" },
        fix: `<span class="k">ls</span> vendor/google_devices/shiba/proprietary/<span class="v">device-vendor.mk</span>
<span class="c"># missing → re-extract</span>
printf '\\nI ACCEPT\\n' | bash extract-*.sh
<span class="k">m</span>`
      },
      {
        tag: "avb",
        msg: "image (bl1_a): rejected, anti-rollback",
        cause: { zh: "刷的 bootloader 比手機目前舊", en: "Flashing older bootloader than current" },
        fix: { zh: "用 ≥ 目前的 build ID。", en: "Pick a build ID ≥ current device version." }
      },
      {
        tag: "lock",
        msg: "Bootloader is locked",
        cause: { zh: "第一次刷 AOSP 必須先解鎖", en: "Must unlock before first AOSP flash" },
        fix: `<span class="k">fastboot</span> flashing unlock
<span class="c"># ⚠️ wipes userdata</span>`
      },
      {
        tag: "verity",
        msg: "fastboot: error: Failed to find AVB_MAGIC at offset: 0",
        cause: { zh: "Pixel 8+ 不要加 --disable-verity", en: "Don't pass --disable-verity on Pixel 8+" },
        fix: `<span class="k">fastboot</span> flashall -w
<span class="c"># NOT: fastboot flashall -w --disable-verity</span>`
      },
      {
        tag: "brick",
        msg: { zh: "變磚 / 無法開機", en: "Bricked / won't boot" },
        cause: { zh: "強制進 fastboot，用官方 factory image 救", en: "Force fastboot, restore via official factory image" },
        fix: `<span class="c"># Hold Power + VolDown to enter fastboot</span>
<span class="k">unzip</span> shiba-&lt;build-id&gt;-factory-*.zip
<span class="k">cd</span> shiba-&lt;build-id&gt; && ./flash-all.sh`
      }
    ]
  },

  benefits: {
    head: { zh: "為什麼要用 Agent Skills造燒錄？", en: "Why wrap the flash workflow as an Agent Skill?" },
    sub: {
      zh: "這整條 pipeline 是「長、吃記憶、但几乎不需要人思考」的典型代表。包裝成 skill 後，人只在「例外」介入。",
      en: "This pipeline is the textbook case of “long, memory-heavy, but barely needs human thought.” Wrapped as a skill, the engineer only intervenes on exceptions."
    },
    cards: [
      {
        ico: "🧠",
        title: { zh: "免背「咒語」", en: "No more memorized incantations" },
        body: {
          zh: "repo init flags、lunch 三段式、fastboot 參數——不用背。Skill 內部已經封裝「為什麼這樣寫」的知識。",
          en: "repo init flags, three-segment lunch, fastboot args — stop memorizing them. The skill encapsulates the “why this exact form” knowledge."
        }
      },
      {
        ico: "⏱️",
        title: { zh: "可以同時推進多個 project", en: "Hold state of multiple projects" },
        body: {
          zh: "以前一次一個 build，等待期間注意力碎片化。現在三條 pipeline 並行跑，人只處理「例外」。",
          en: "Before: one build at a time, fragmented attention. After: three pipelines in parallel, human only handles exceptions."
        }
      },
      {
        ico: "🔁",
        title: { zh: "可預期錯誤自動復健", en: "Predictable failures self-heal" },
        body: {
          zh: "repo sync 撞 503？自動降低並行數重試。網路中斷？斷點續傳。不用人眼盯完 30 分鐘。",
          en: "repo sync 503? Auto-throttle and retry. Network drop? Resume. No human watching the terminal for 30 minutes."
        }
      },
      {
        ico: "✅",
        title: { zh: "連鎖驗證不遗漏", en: "Verification chain never skipped" },
        body: {
          zh: "SHA-256、device-vendor.mk 是否存在、lunch target 是否成功——人會依、AI 不會。避免煤炸式 bootloop。",
          en: "SHA-256, device-vendor.mk presence, lunch target sanity — humans skip these, AI doesn’t. Catches bootloops before they happen."
        }
      },
      {
        ico: "📝",
        title: { zh: "每一步有 audit trail", en: "Every step is auditable" },
        body: {
          zh: "每個階段的狀態、指令、log 都寫下來。出問題能追溯「是哪一步出問題」，而不是「重跳一次看看」。",
          en: "Every stage logs its state, commands, output. Failures trace to the exact step — not “run it again and see”."
        }
      },
      {
        ico: "🚫",
        title: { zh: "不可逆操作一律暫停", en: "Irreversible ops always pause" },
        body: {
          zh: "bootloader unlock、-w 清 userdata——AI 永遠不自動跑，等人確認。設計上規澆不會手滑。",
          en: "bootloader unlock, -w wiping userdata — AI never auto-runs these. Pause-and-confirm by design, fat-finger-proof."
        }
      }
    ],
    formula: {
      lhs: { zh: "人的輸入", en: "Human input" },
      rhs: { zh: "AI 推進的 pipeline", en: "AI-driven pipeline" },
      input: "BP4A.251205.006",
      output: { zh: "一列 ready-to-flash images", en: "a set of ready-to-flash images" }
    }
  },

  sections: {
    align: { zh: "01 三版本對齊", en: "01 The three-way alignment" },
    benefits: { zh: "02 為什麼用 Agent Skills", en: "02 Why Agent Skills" },
    pipeline: { zh: "03 互動式 Pipeline", en: "03 Interactive pipeline" },
    boundary: { zh: "04 Human-in-the-Loop", en: "04 Human-in-the-Loop" },
    shift: { zh: "05 Executor → Supervisor", en: "05 Executor → Supervisor" },
    slots: { zh: "06 A/B Slot 機制", en: "06 A/B slot mechanism" },
    errors: { zh: "07 錯誤與救磚", en: "07 Errors & recovery" }
  }
};
