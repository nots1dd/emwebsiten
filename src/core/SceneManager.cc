#include <mywebsite/core/SceneManager.hpp>

void SceneManager::set(std::unique_ptr<Scene> scene)
{
  current_ = std::move(scene);
  current_->init();
}

void SceneManager::update(float t)
{
  if (current_)
    current_->update(t);
}

void SceneManager::render(Renderer& renderer)
{
  if (current_)
    current_->render(renderer);
}
