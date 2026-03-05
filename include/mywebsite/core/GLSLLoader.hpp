#pragma once

#include <string>
#include <unordered_set>

class GLSLLoader
{
public:
  // Load + preprocess a shader file
  static auto load(const std::string& path, const std::string& version = "300 es",
                   const std::string& precision = "mediump float") -> std::string;

private:
  static auto load_file(const std::string& path) -> std::string;
  static auto preprocess(const std::string& source, const std::string& base_dir,
                         std::unordered_set<std::string>& include_guard) -> std::string;
};
