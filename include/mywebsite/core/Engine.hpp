#pragma once

#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/core/Router.hpp>
#include <mywebsite/core/ShaderRegistry.hpp>
#include <mywebsite/scene/transitions/ShaderTransition.hpp>

class Engine
{
public:
  void init();
  void frame();
  void set_mouse(float x, float y);
  void accumulate_mouse_delta(float dx, float dy);

  SceneGraph graph_;

  template <ShaderID S>
  void set_theme(Route route, bool dark)
  {
    currentRoute_ = route;
    darkMode_     = dark;

    transition_to<S>(route, dark, 1.5f);
  }

  template <ShaderID S>
  void navigate(Route route)
  {
    currentRoute_ = route;

    transition_to<S>(route, darkMode_, 1.2f);
  }

  template <ShaderID S>
  void transition_to(Route route, bool dark, float duration = 1.2f)
  {
    auto& tran       = AssetManager::instance().shaders().program<S>();
    auto  transition = std::make_unique<ShaderTransition>(tran, duration);

    graph_.transition(make_scene(route, dark), std::move(transition));
  }

  // public methods for JS boundary
  void navigate_home() { navigate<ShaderID::crack_transition>(Route::Home); }

  void navigate_about() { navigate<ShaderID::crack_transition>(Route::About); }

  void set_theme_home(bool dark) { set_theme<ShaderID::liquid_transition>(Route::Home, dark); }

  void set_theme_about(bool dark) { set_theme<ShaderID::glitch_transition>(Route::About, dark); }

  Renderer* renderer_ = nullptr;

private:
  Route currentRoute_ = Route::Home;
  bool  darkMode_     = false;
  float mouse_dx      = 0.0f;
  float mouse_dy      = 0.0f;

  float mouse_x = 0.0f;
  float mouse_y = 0.0f;
};
