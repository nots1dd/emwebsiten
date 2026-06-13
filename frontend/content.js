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
  //   about           — a few sentences shown inside the preview
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
        about: "A few sentences about tibs go here — what it does, why you built it, and what makes it interesting. Replace this placeholder.",
        images: [],
      },
      {
        title: "inLimbo",
        body: "Advanced audio library management and playback tool",
        link: "https://github.com/nots1dd/inLimbo",
        status: "active",
        about: "A few sentences about inLimbo go here. Replace this placeholder.",
        images: [],
      },
      {
        title: "Anvilock",
        body: "Simple Screen Locker for Wayland based Compositors",
        link: "https://github.com/muvilon/anvilock",
        status: "active",
        about: "A few sentences about Anvilock go here. Replace this placeholder.",
        images: [],
      },
      {
        title: "Wavy",
        body: "Audio Streaming and Sharing Platform for popular audio formats",
        link: "https://github.com/Oinkognito/wavy",
        status: "WIP",
        about: "A few sentences about Wavy go here. Replace this placeholder.",
        images: [],
      },
      {
        title: "obZcene",
        body: "Very obscene and primitive attempt at making a game engine in C using SDL and math.",
        link: "https://github.com/nots1dd/obzcene",
        status: "experimental",
        about: "A few sentences about obZcene go here. Replace this placeholder.",
        images: ["https://github.com/nots1dd/obZcene/blob/dev/assets/example.png"],
      },
      {
        title: "rAVen",
        body: "Audio Visualizer written in Raylib that looks cool",
        link: "https://github.com/nots1dd/rAVen",
        status: "stable",
        about: "A few sentences about rAVen go here. Replace this placeholder.",
        images: ["https://private-user-images.githubusercontent.com/140317709/369522447-51a291b7-12d6-41b1-af3d-52759791a093.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODEzNTgyOTAsIm5iZiI6MTc4MTM1Nzk5MCwicGF0aCI6Ii8xNDAzMTc3MDkvMzY5NTIyNDQ3LTUxYTI5MWI3LTEyZDYtNDFiMS1hZjNkLTUyNzU5NzkxYTA5My5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjEzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxM1QxMzM5NTBaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hN2VhMzFiNjZlNDVkNjI0MmJhNDU5M2ZiNDBhNGVjMDM1NzcwMWNmODQ4ZmUxOTFkMDJlMDk3NzJhZjEwOGZjJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.cB696AeKaN4W4XEIjytETy6uVxmYn6HKXf_pNAW6Jsc"],
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
