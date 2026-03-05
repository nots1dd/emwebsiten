#pragma once

#include <memory>
#include <mywebsite/gl/Program.hpp>
#include <string>
#include <unordered_map>

class ShaderLibrary
{
public:
  static auto instance() -> ShaderLibrary&;

  void load_program(const std::string& name, const std::string& vs_path,
                    const std::string& fs_path);

  auto program(const std::string& name) -> Program&;

private:
  std::unordered_map<std::string, std::unique_ptr<Program>> programs_;
};
