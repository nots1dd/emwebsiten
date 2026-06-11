#pragma once

#include <memory>
#include <mywebsite/scene/About.hpp>
#include <mywebsite/scene/Blog.hpp>
#include <mywebsite/scene/Home.hpp>
#include <mywebsite/scene/Project.hpp>
#include <mywebsite/scene/SceneGraphNode.hpp>
#include <mywebsite/scene/UnderConstruction.hpp>

enum class Route
{
  Home,
  About,
  Projects,
  Blog
};

inline auto make_scene(Route route, bool dark) -> std::unique_ptr<Scene>
{
  Theme theme = dark ? Theme::Inverted : Theme::Normal;

  switch (route)
  {
    case Route::Home:
      return std::make_unique<HomeScene>(theme);

    case Route::About:
      return std::make_unique<AboutScene>(theme);

    case Route::Projects:
      return std::make_unique<ProjectScene>(theme);

    case Route::Blog:
      return std::make_unique<BlogScene>(theme);
  }

  return std::make_unique<HomeScene>(theme); // fallback
}
