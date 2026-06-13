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
  },

  // ---- ABOUT ( /about ) ----
  about: {
    title:    "About me",
    subtitle: "",

    // opening paragraph
    intro: {
      heading: "Me",
      body:    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },

    // a list of cards — add / remove { } blocks freely
    work: {
      heading: "What I Do",
      items: [
        { title: "thing 1", body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium." },
        { title: "thing 2", body: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam." },
        { title: "thing 3", body: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum." },
      ],
    },

    // closing paragraph
    currently: {
      heading: "Currently",
      body:    "lorem jipsum",
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
        date: "2024",
        about: "A few sentences about tibs go here — what it does, why you built it, and what makes it interesting. Replace this placeholder.",
        tags: ["compiler", "CLI11", "nlohmann-json", "package-manager", "transpiler"],
        images: [],
      },
      {
        title: "inLimbo",
        body: "Advanced audio library management and playback tool",
        link: "https://github.com/nots1dd/inLimbo",
        status: "active",
        lang: "C++",
        date: "2024",
        about: "A few sentences about inLimbo go here. Replace this placeholder.",
        tags: ["audio", "TUI", "ncurses", "library", "playback"],
        images: [],
      },
      {
        title: "Anvilock",
        body: "Simple Screen Locker for Wayland based Compositors",
        link: "https://github.com/muvilon/anvilock",
        status: "active",
        lang: "C",
        date: "2024",
        about: "A few sentences about Anvilock go here. Replace this placeholder.",
        tags: ["wayland", "screen-locker", "PAM", "security", "OpenGL"],
        images: [],
      },
      {
        title: "Wavy",
        body: "Audio Streaming and Sharing Platform for popular audio formats",
        link: "https://github.com/Oinkognito/wavy",
        status: "WIP",
        lang: "C++",
        date: "2024",
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
        date: "2023",
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
        date: "2023",
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
