#include "md4c-html.h"
#include <mywebsite/core/Engine.hpp>
#include <mywebsite/core/GLContext.hpp>

static Engine engine;

extern "C"
{

  EMSCRIPTEN_KEEPALIVE
  void set_mouse(float x, float y) { engine.set_mouse(x, y); }

  EMSCRIPTEN_KEEPALIVE
  void accumulate_mouse_delta(float dx, float dy) { engine.accumulate_mouse_delta(dx, dy); }

  EMSCRIPTEN_KEEPALIVE
  void set_theme_home(bool dark) { engine.set_theme_home(dark); }

  EMSCRIPTEN_KEEPALIVE
  void set_theme_about(bool dark) { engine.set_theme_about(dark); }

  EMSCRIPTEN_KEEPALIVE
  void navigate_home() { engine.navigate_home(); }

  EMSCRIPTEN_KEEPALIVE
  void navigate_about() { engine.navigate_about(); }
}

// md4c stuff

extern "C"
{
  EMSCRIPTEN_KEEPALIVE
  auto md_to_html(const char* input) -> const char*
  {
    static std::string output;
    output.clear();

    auto callback = [](const MD_CHAR* text, MD_SIZE size, void* userdata) -> void
    {
      auto* out = static_cast<std::string*>(userdata);
      out->append(text, size);
    };

    md_html(input, strlen(input), callback, &output, 0, 0);

    return output.c_str();
  }
}

void frame() { engine.frame(); }

auto main() -> int
{
  GLContext ctx("#canvas");
  ctx.make_current();

  engine.init();

  emscripten_set_main_loop(frame, 0, true);

  return 0;
}
