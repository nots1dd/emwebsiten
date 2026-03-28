#pragma once

#include <memory>
#include <mywebsite/scene/About.hpp>
#include <mywebsite/scene/AboutInv.hpp>
#include <mywebsite/scene/Home.hpp>
#include <mywebsite/scene/HomeInv.hpp>
#include <mywebsite/scene/SceneGraphNode.hpp>
#include <mywebsite/scene/UnderConstruction.hpp>

enum class Route
{
  Home,
  About,
  Blog,
  Projects
};

inline auto make_scene(Route route, bool dark) -> std::unique_ptr<Scene>
{
  switch (route)
  {
    case Route::Home:
    {
      if (dark)
        return std::make_unique<HomeInvScene>();
      else
        return std::make_unique<HomeScene>();
    }

    case Route::About:
    {
      if (dark)
        return std::make_unique<AboutInvScene>();
      else
        return std::make_unique<AboutScene>();
    }

      // case Route::Blog:
      //   return dark ? std::make_unique<BlogInvScene>()
      //               : std::make_unique<BlogScene>();
      //
      // case Route::Projects:
      //   return dark ? std::make_unique<ProjectsInvScene>()
      //               : std::make_unique<ProjectsScene>();
  }

  return std::make_unique<HomeScene>(); // fallback
}
