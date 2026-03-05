#include <emscripten/emscripten.h>
#include <mywebsite/core/Engine.hpp>
#include <mywebsite/core/GLContext.hpp>

static Engine engine;

void frame() { engine.frame(); }

auto main() -> int
{

  GLContext ctx("#canvas");
  ctx.make_current();

  engine.init();

  emscripten_set_main_loop(frame, 0, true);

  return EXIT_SUCCESS;
}
