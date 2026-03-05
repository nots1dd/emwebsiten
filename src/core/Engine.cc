#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Engine.hpp>
#include <mywebsite/scene/Plasma.hpp>

static Renderer*     global_renderer = nullptr;
static FrameUniforms frameData;
static double        lastTime = 0.0;

void Engine::init()
{

  AssetManager::instance().initialize();

  auto& program = AssetManager::instance().shaders().program("plasma");

  static Renderer renderer(program);

  renderer_       = &renderer;
  global_renderer = &renderer;

  scenes_.set(std::make_unique<PlasmaScene>());
}

void Engine::frame()
{

  double now = emscripten_get_now() * 0.001;

  frameData.delta = now - lastTime;
  frameData.time  = now;

  lastTime = now;

  frameData.width  = 800;
  frameData.height = 600;

  frameData.frame++;

  renderer_->render(frameData);
}
