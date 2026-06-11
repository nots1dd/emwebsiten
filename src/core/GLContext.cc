#include <mywebsite/core/GLContext.hpp>
#include <print>

GLContext::GLContext(const char* canvas)
{
  EmscriptenWebGLContextAttributes attr;
  emscripten_webgl_init_context_attributes(&attr);
  attr.majorVersion = 2;
  attr.minorVersion = 0;
  attr.alpha        = false;

  // The renderer draws fullscreen passes with depth testing disabled, so depth
  // and stencil buffers are pure waste. Keep MSAA on for clean edges and ask
  // the browser for the high-performance (discrete) GPU.
  attr.depth           = false;
  attr.stencil         = false;
  attr.antialias       = true;
  attr.powerPreference = EM_WEBGL_POWER_PREFERENCE_HIGH_PERFORMANCE;

  ctx_ = emscripten_webgl_create_context(canvas, &attr);
  if (!ctx_)
  {
    std::println("Failed to create WebGL2 context");
  }
}

void GLContext::make_current()
{
  EMSCRIPTEN_RESULT r = emscripten_webgl_make_context_current(ctx_);
  if (r != EMSCRIPTEN_RESULT_SUCCESS)
  {
    std::println("Failed to make WebGL context current: {}", int(r));
  }
}
