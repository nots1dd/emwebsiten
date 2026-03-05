#include <algorithm>
#include <emscripten/emscripten.h>
#include <mywebsite/core/Engine.hpp>
#include <mywebsite/core/GLContext.hpp>

static Engine engine;

extern "C"
{

  EMSCRIPTEN_KEEPALIVE
  void set_input_enabled(int enabled) { engine.set_input_enabled(enabled); }

  EMSCRIPTEN_KEEPALIVE
  void mouse_move(float dx, float dy) { engine.mouse_move(dx, dy); }
}

void frame() { engine.frame(); }

auto main() -> int
{
  GLContext ctx("#canvas");
  ctx.make_current();

  engine.init();

  emscripten_set_main_loop(frame, 0, true);

  return EXIT_SUCCESS;
}
