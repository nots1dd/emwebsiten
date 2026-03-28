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

void frame() { engine.frame(); }

auto main() -> int
{
  GLContext ctx("#canvas");
  ctx.make_current();

  engine.init();

  emscripten_set_main_loop(frame, 0, true);

  return 0;
}
