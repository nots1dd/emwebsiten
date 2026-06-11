#include <algorithm>
#include <cmath>
#include <mywebsite/core/camera/Camera.hpp>

static auto ortho(float l, float r, float b, float t) -> std::array<float, 16>
{
  return {2.f / (r - l),      0, 0, 0, 0, 2.f / (t - b), 0, 0, 0, 0, -1.f, 0, -(r + l) / (r - l),
          -(t + b) / (t - b), 0, 1};
}

Camera::Camera(float width, float height)
{
  resize(width, height);
  update_view();
}

void Camera::resize(float width, float height)
{
  // Idempotent: skip the recompute when neither the viewport nor the zoom that
  // the cached projection was built with has changed.
  if (width == width_ && height == height_ && zoom_ == proj_zoom_)
    return;

  width_     = width;
  height_    = height;
  proj_zoom_ = zoom_;

  proj_ = ortho(-width_ / 2.f * zoom_, width_ / 2.f * zoom_, -height_ / 2.f * zoom_,
                height_ / 2.f * zoom_);
}

void Camera::set_zoom(float z)
{
  zoom_ = z;
  resize(width_, height_);
}

void Camera::set_position(float x, float y, float z)
{
  position_ = {x, y, z};
  update_view();
}

void Camera::move_forward(float d)
{
  position_[2] -= d;
  update_view();
}

void Camera::move_backward(float d)
{
  position_[2] += d;
  update_view();
}

void Camera::move_left(float d)
{
  position_[0] -= d;
  update_view();
}

void Camera::move_right(float d)
{
  position_[0] += d;
  update_view();
}

void Camera::rotate(float dx, float dy)
{
  yaw += dx;
  pitch += dy;

  pitch = std::clamp(pitch, -1.5f, 1.5f);

  update_view();
}

void Camera::update_view()
{
  const float cx = std::cos(pitch);
  const float sx = std::sin(pitch);
  const float cy = std::cos(yaw);
  const float sy = std::sin(yaw);

  // Camera basis from yaw/pitch (unit length; pitch is clamped away from ±90°
  // in rotate(), so 'forward' never aligns with world-up).
  const std::array<float, 3> forward = {cy * cx, sx, sy * cx};

  // right = normalize(forward x worldUp), worldUp = (0,1,0)
  std::array<float, 3> right = {-forward[2], 0.f, forward[0]};
  const float rlen = std::sqrt(right[0] * right[0] + right[2] * right[2]);
  right[0] /= rlen;
  right[2] /= rlen;

  // up = right x forward
  const std::array<float, 3> up = {right[1] * forward[2] - right[2] * forward[1],
                                   right[2] * forward[0] - right[0] * forward[2],
                                   right[0] * forward[1] - right[1] * forward[0]};

  // Column-major: columns map view-space axes to world space, so that shaders
  // doing (uView * vec4(dir, 0)) rotate a ray direction. View -z is the look
  // direction, hence col2 = -forward. Translation is -position.
  view_ = {right[0],      right[1],      right[2],      0.f,
           up[0],         up[1],         up[2],         0.f,
           -forward[0],   -forward[1],   -forward[2],   0.f,
           -position_[0], -position_[1], -position_[2], 1.f};
}

auto Camera::projection() const -> const float* { return proj_.data(); }

auto Camera::view() const -> const float* { return view_.data(); }

auto Camera::position() const -> const float* { return position_.data(); }

auto Camera::zoom() const -> float { return zoom_; }
