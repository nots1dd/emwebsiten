#pragma once

#include <memory>
#include <mywebsite/scene/Scene.hpp>
#include <mywebsite/scene/Transition.hpp>

class SceneNode
{
public:
  explicit SceneNode(std::unique_ptr<Scene> s) : scene_(std::move(s))
  {
    if (scene_)
      scene_->init();
  }

  auto scene() -> Scene* { return scene_.get(); }

  void update(float t)
  {
    if (scene_)
      scene_->update(t);
  }

  void render(Renderer& r)
  {
    if (scene_)
      scene_->render(r);
  }

private:
  std::unique_ptr<Scene> scene_;
};

class SceneGraph
{
public:
  void set(std::unique_ptr<Scene> scene);

  void transition(std::unique_ptr<Scene> scene, std::unique_ptr<Transition> transition);

  void update(float dt);

  void render(Renderer& r);

  [[nodiscard]]
  auto current() -> Scene*
  {
    return current_ ? current_->scene() : nullptr;
  }

private:
  std::unique_ptr<SceneNode> current_;
  std::unique_ptr<SceneNode> next_;

  std::unique_ptr<Transition> transition_;
};
