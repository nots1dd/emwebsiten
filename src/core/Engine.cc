#include "mywebsite/scene/CRT.hpp"
#include <algorithm>
#include <emscripten/html5.h>
#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Engine.hpp>
#include <mywebsite/scene/Plasma.hpp>

static double lastTime = 0.0;

static bool key_w = false;
static bool key_a = false;
static bool key_s = false;
static bool key_d = false;

void Engine::set_input_enabled(bool v)
{
  input_enabled = v;

  if (!v)
  {
    key_w = key_a = key_s = key_d = false;
  }
}

void Engine::mouse_move(float dx, float dy)
{
  mouse_dx += dx;
  mouse_dy += dy;
}

EM_BOOL keydown_callback(int, const EmscriptenKeyboardEvent* e, void* userData)
{
  auto* engine = static_cast<Engine*>(userData);

  if (!engine->input_enabled)
    return EM_FALSE;

  char k = std::tolower(e->key[0]);

  if (k == 'w')
    key_w = true;
  if (k == 'a')
    key_a = true;
  if (k == 's')
    key_s = true;
  if (k == 'd')
    key_d = true;

  return EM_TRUE;
}

EM_BOOL keyup_callback(int, const EmscriptenKeyboardEvent* e, void* userData)
{
  auto* engine = static_cast<Engine*>(userData);

  if (!engine->input_enabled)
    return EM_FALSE;

  char k = std::tolower(e->key[0]);

  if (k == 'w')
    key_w = false;
  if (k == 'a')
    key_a = false;
  if (k == 's')
    key_s = false;
  if (k == 'd')
    key_d = false;

  return EM_TRUE;
}

EM_BOOL wheel_callback(int, const EmscriptenWheelEvent* e, void* userData)
{
  auto* engine = static_cast<Engine*>(userData);

  if (!engine->input_enabled)
    return EM_FALSE;

  Scene* scene = engine->scenes_.current();

  float zoom = scene->camera().zoom();

  zoom += e->deltaY * 0.001f;
  zoom = std::clamp(zoom, 0.2f, 5.0f);

  scene->camera().set_zoom(zoom);

  return EM_TRUE;
}

void Engine::init()
{
  AssetManager::instance().initialize();

  auto& program = AssetManager::instance().shaders().program("plasma");

  static Renderer renderer(program);

  renderer_ = &renderer;

  scenes_.set(std::make_unique<PlasmaScene>());

  Scene* activeScene = scenes_.current(); // get scene pointer

  emscripten_set_wheel_callback(EMSCRIPTEN_EVENT_TARGET_DOCUMENT, activeScene, true,
                                wheel_callback);

  emscripten_set_keydown_callback(EMSCRIPTEN_EVENT_TARGET_WINDOW, this, true, keydown_callback);

  emscripten_set_keyup_callback(EMSCRIPTEN_EVENT_TARGET_WINDOW, this, true, keyup_callback);
}

void Engine::frame()
{
  double now = emscripten_get_now() * 0.001;

  double delta = now - lastTime;
  lastTime     = now;

  Scene* scene = scenes_.current();

  scene->update(now);

  Camera& cam = scene->camera();

  float speed = 2.5f * delta;

  if (key_w)
    cam.move_forward(speed);
  if (key_s)
    cam.move_backward(speed);
  if (key_a)
    cam.move_left(speed);
  if (key_d)
    cam.move_right(speed);

  if (input_enabled)
  {
    float sensitivity = 0.002f;

    cam.rotate(mouse_dx * sensitivity, mouse_dy * sensitivity);

    mouse_dx = 0;
    mouse_dy = 0;
  }

  scene->render(*renderer_);
}
