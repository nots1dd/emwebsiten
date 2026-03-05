#include <algorithm>
#include <cmath>
#include <mywebsite/core/camera/Camera.hpp>

static auto ortho(float l, float r, float b, float t) -> std::array<float, 16>
{
  return {2.f / (r - l),      0, 0, 0, 0, 2.f / (t - b), 0, 0, 0, 0, -1.f, 0, -(r + l) / (r - l),
          -(t + b) / (t - b), 0, 1};
}

static auto look_at(float x, float y, float z) -> std::array<float, 16>
{
  return {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1};
}

Camera::Camera(float width, float height)
{
  resize(width, height);
  update_view();
}

void Camera::resize(float width, float height)
{
  width_  = width;
  height_ = height;

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
  float cx = cos(pitch);
  float sx = sin(pitch);

  float cy = cos(yaw);
  float sy = sin(yaw);

  float forward[3] = {cy * cx, sx, sy * cx};

  view_ = look_at(position_[0], position_[1], position_[2]);
}

auto Camera::projection() const -> const float* { return proj_.data(); }

auto Camera::view() const -> const float* { return view_.data(); }

auto Camera::position() const -> const float* { return position_.data(); }

auto Camera::zoom() const -> float { return zoom_; }
