#include <memory>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/SceneGraphNode.hpp>
#include <print>

void SceneGraph::set(std::unique_ptr<Scene> scene)
{
  current_ = std::make_unique<SceneNode>(std::move(scene));
}

void SceneGraph::transition(std::unique_ptr<Scene> scene, std::unique_ptr<Transition> t)
{
  std::println("[SceneGraph] starting transition");

  next_ = std::make_unique<SceneNode>(std::move(scene));

  transition_ = std::move(t);
  transition_->begin();
}

void SceneGraph::update(float dt)
{
  if (current_)
    current_->update(dt);

  if (transition_)
  {
    transition_->update(dt);

    if (next_)
      next_->update(dt);
  }
}

void SceneGraph::resize(float w, float h)
{
  if (current_ && current_->scene())
    current_->scene()->camera().resize(w, h);

  if (next_ && next_->scene())
    next_->scene()->camera().resize(w, h);
}

void SceneGraph::render(Renderer& r)
{
  if (!transition_)
  {
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    if (current_)
      current_->render(r);
    return;
  }

  GLuint texA = r.render_scene_to_texture(current_.get());
  GLuint texB = r.render_scene_to_texture(next_.get());

  transition_->render(r, texA, texB);

  if (transition_->finished())
  {
    std::println("[SceneGraph] transition finished");

    current_ = std::move(next_);
    transition_.reset();
  }
}
