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
    title:    "nots1dd",
    subtitle: "some guy tryna do nothing",

    // 1 to 3 paragraphs. Each string becomes its own paragraph.
    paragraphs: [
      "I build things — systems software, audio tooling, shaders, and the odd website that pretends to be a black hole.",
      "Most of what I make is open source and a little over-engineered for fun. If something here looks interesting, the projects page has the good stuff.",
    ],
  },

  // ---- ABOUT ( /about ) ----
  about: {
    title:    "about",
    subtitle: "who even am i",

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
  projects: {
    heading: "Projects",
    sub:     "Notes on some shit i do.",

    // each card. `link` can be an external URL (opens in a new tab) or an
    // internal route like "/blog/test1".
    items: [
      { title: "inLimbo",  body: "proj 1", link: "https://github.com/nots1dd/inLimbo" },
      { title: "Anvilock", body: "proj 2", link: "https://github.com/muvilon/anvilock" },
      { title: "Wavy",     body: "proj 3", link: "https://github.com/Oinkognito/wavy" },
    ],
  },

  // ---- BLOG ( /blog ) ----
  // The blog list builds itself automatically from BLOG_POSTS below — you only
  // edit the heading/sub here, and add posts in BLOG_POSTS.
  blog: {
    heading: "Blog",
    sub:     "Notes on some shit i do.",
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
  "/blog/test1": {
    title: "world hello",
    blurb: "yaydaydhwinf",
    file:  "/public/blogs/test.md",
  },
  "/blog/test2": {
    title: "Hello world",
    blurb: "part 2 of whatever part1 is.",
    file:  "/public/blogs/test2.md",
  },
};
