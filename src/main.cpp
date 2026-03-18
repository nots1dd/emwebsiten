#include <mywebsite/core/Engine.hpp>
#include <mywebsite/core/GLContext.hpp>

static Engine engine;

extern "C"
{

  EMSCRIPTEN_KEEPALIVE
  void set_mouse(float x, float y) { engine.set_mouse(x, y); }
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
