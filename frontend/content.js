// ============================================================================
//  SITE CONTENT — edit everything here.
//
//  This is the only file you need to touch to change page text. Every page and
//  every list item below is a plain string. No HTML, no markup — just edit the
//  quotes. Lines with `//` are comments and are ignored.
//
//  Tips:
//   - Keep the quotes "" around each piece of text.
//   - Keep the commas , at the end of each line.
//   - Add a list item by copying a { ... } block and changing its text.
// ============================================================================

export const CONTENT = {
  // ---- HOME ( / ) — just the intro. Nothing else lives here. ----
  home: {
    title:    "Siddharth Karanam",
    subtitle: "nots1dd",

    // 1 to 3 paragraphs. Each string becomes its own paragraph.
    paragraphs: [
      "I build things (mostly devtools) for myself and sometimes for others. Also an avid open source contributor and an enthusiast in operating systems (linux), compiler design, multimedia and wayland. When am not procrastinating, I like to listen to music, travel and play games and watch shows. Yes I am a boring person.",
      "As for a formal introduction, I am a final year student at VIT Chennai who is well versed in systems level languages and aims to work in low level engineering.",
    ],

    // Hover the "?" badge on the intro card to reveal one of these at random.
    // Add website facts or any general trivia you like — one string each.
    factoids: [
      "This whole background is a live WebGL2 shader, written in C++ and compiled to WebAssembly.",
      "Every route has its own shader and contrasting shader for dark and light themes.",
      "Move your cursor slowly onto the canvas to see somethin special :)",
      "Press '?' anytime to see every keyboard shortcut. Try 'gp' to jump to projects.",
      "Toggling the theme fires a shader transition — a spacetime rip, a sunrise, or a frost bloom.",
      "There's no UI framework here: just vanilla JS, hand-written CSS, and a lot of GLSL.",
      "Press 'ct' to flip between day and night. The scene re-lights itself in real time.",
    ],
  },

  // ---- ABOUT ( /about ) ----
  about: {
    title:    "About me",
    subtitle: "",

    // opening paragraph
    intro: {
      heading: "Me",
      body:    "This is more of a general list about the things I like to be associated with.",
    },

    // a list of cards — add / remove { } blocks freely
    work: {
      heading: "What I Do / Wanna do",
      items: [
        { title: "Wannabe computer nerd", body: "Doing a bachelors in computer science often has this side effect" },
        { title: "Play games", body: "Not very genre specific, started with paper toss from way back when, more into FPS games with lore and currently lovin minecraft" },
        { title: "Listening to music", body: "Had a very weird phase of rap/R&B back in 2017 and didnt explore much till 2020 when I started listening to classical pieces (mostly Mozart, Chopin and Paganini) and was obsessed with Joji. Since 2023 however, after being introduced to rock and nu metal, gears shifted and am currently lovin Meshuggah, Opeth and Gojira." },
        { title: "Watching shows/movies", body: "Never have enough time for this, but on the off chance I do, I prefer to watch thrillers/dramas, Sci-Fi, psychological horror, animation movies and some comfort sitcoms. Yes I also watch anime but not as much anymore (as is obvious by the website's favicon)" },
        { title: "Travelling", body: "Not the thrifty kind, just small vacations along indian coastlines and islands, originally stemmed from that one europe trip that made me wanna travel and see more of the world"},
        { title: "Play sports", body: "Although I am becoming incredibly lazy, I still enjoy playing table tennis, football, cricket and swimming. As a sidefact I used to be addicted to chess during lockdown which may or may not have affected my studies" },
        { title: "Write", body: "I enjoy writing poems and writing plausible storyboards that will never be completed as a very reserved hobby, hopefully one day I will post some of my stuff here" },
      ],
    },

    // closing paragraph
    currently: {
      heading: "Currently",
      body:    "Working on writing more blog posts, learning about functional programming and kernel development",
    },
  },

  // ---- PROJECTS ( /projects ) ----
  // Each project is an expandable card. Clicking it opens a preview dropdown.
  //   title  / body   — shown on the card header (body = one-line tagline)
  //   link            — external URL (opens in a new tab) or internal route
  //   status          — small badge. Known colors: active, wip, stable,
  //                     archived, experimental (anything else = neutral grey)
  //   lang            — language badge shown on the header (e.g. "C++")
  //   date            — shown right-aligned on the header (e.g. "2024")
  //   about           — a few sentences shown inside the preview
  //   tags            — pixel chips inside the preview (e.g. ["compiler", …])
  //   images          — array of pictures in the preview. Each entry is either
  //                     a local path ("/public/projects/foo.png") OR a full
  //                     URL ("https://…"). Use [] for none. GitHub "blob" links
  //                     (github.com/u/r/blob/…) are auto-converted to raw so
  //                     they actually display.
  projects: {
    heading: "Projects",
    sub:     "Here are some of the projects I have worked on",

    items: [
      {
        title: "tibs",
        body: "Transpiler Infrastructure for C/C++ build systems",
        link: "https://github.com/nots1dd/tibs",
        status: "WIP",
        lang: "C++",
        date: "2026",
        about: "tibs (Transpiler Infrastructure for Build Systems) aims to be an upcoming compiler infrastructure for existing C/C++ meta and core build systems like CMake, Make, Autoconf, Ninja, so on. It has an in-house transpiler shipped on top of a central package and project manager that handles the entire lifetime and build files of your project.",
        tags: ["compiler", "CLI11", "nlohmann-json", "package-manager", "transpiler"],
        images: [],
      },
      {
        title: "inLimbo",
        body: "Advanced audio library management and playback tool",
        link: "https://github.com/nots1dd/inLimbo",
        status: "active",
        lang: "C++",
        date: "2025",
        about: "The inLimbo project aims to be a new upcoming TUI music player for *NIX based operating systems that gives music lovers a clean and efficient environment to browse, play and interact with your favourite offline music.",
        tags: ["music-player", "taglib", "TUI", "toml-config", "dbus", "openssl", "ftxui"],
        images: [],
      },
      {
        title: "Anvilock",
        body: "Simple Screen Locker for Wayland based Compositors",
        link: "https://github.com/muvilon/anvilock",
        status: "WIP",
        lang: "C++",
        date: "2025",
        about: "An upcoming screen lock for Wayland compositors that abides by the ext-session-lock-v1 Wayland Protocol.",
        tags: ["wayland", "screen-locker", "PAM", "wayland-egl", "xkb", "stb_image", "OpenGL-ES"],
        images: [],
      },
      {
        title: "Wavy",
        body: "Audio Streaming and Sharing Platform for popular audio formats",
        link: "https://github.com/Oinkognito/wavy",
        status: "WIP",
        lang: "C++",
        date: "2025",
        about: "A few sentences about Wavy go here. Replace this placeholder.",
        tags: ["audio", "streaming", "networking", "FLAC", "server"],
        images: [],
      },
      {
        title: "obZcene",
        body: "Very obscene and primitive attempt at making a game engine in C using SDL and math.",
        link: "https://github.com/nots1dd/obzcene",
        status: "experimental",
        lang: "C",
        date: "2025",
        about: "A few sentences about obZcene go here. Replace this placeholder.",
        tags: ["game-engine", "SDL", "math", "experimental"],
        images: ["https://github.com/nots1dd/obZcene/blob/dev/assets/example.png"],
      },
      {
        title: "rAVen",
        body: "Audio Visualizer written in Raylib that looks cool",
        link: "https://github.com/nots1dd/rAVen",
        status: "stable",
        lang: "C",
        date: "2024",
        about: "A few sentences about rAVen go here. Replace this placeholder.",
        tags: ["raylib", "visualizer", "audio", "FFT", "graphics"],
        images: ["/public/images/rAVen-preview-1.png"],
      },
    ],
  },

  // ---- BLOG ( /blog ) ----
  // The blog list builds itself automatically from BLOG_POSTS below — you only
  // edit the heading/sub here, and add posts in BLOG_POSTS.
  blog: {
    heading: "Blog",
    sub:     "A stale attempt at writing blogposts are here",
  },
};

// ============================================================================
//  BLOG POSTS
//
//  One entry per post. This single list drives BOTH the /blog index cards and
//  the post page itself. To add a post: copy a block, set its route key, title,
//  a short blurb, and the markdown file under /public/blogs/.
// ============================================================================

export const BLOG_POSTS = {
  "/blog/rust-projects-to-wasm": {
    title: "Rust projects to Wasm",
    blurb: "Jul 4, 2025",
    file:  "/public/blogs/rust-projs-to-wasm.md",
  },
  "/blog/anvilock": {
    title: "Anvilock blog",
    blurb: "Mar 9, 2025",
    file:  "/public/blogs/anvilock-blog.md",
  },
};
