#include "mywebsite/core/GLSLLoader.hpp"
#include <fstream>
#include <print>
#include <sstream>

auto GLSLLoader::load_file(const std::string& path) -> std::string
{
  std::ifstream file(path);
  if (!file)
  {
    std::println("GLSLLoader: failed to open {}", path);
    return {};
  }

  std::stringstream ss;
  ss << file.rdbuf();
  return ss.str();
}

auto GLSLLoader::preprocess(const std::string& source, const std::string& base_dir,
                            std::unordered_set<std::string>& include_guard) -> std::string
{
  std::stringstream input(source);
  std::stringstream output;
  std::string       line;

  while (std::getline(input, line))
  {
    // #include "file.glsl"
    if (line.starts_with("#include"))
    {
      auto start = line.find('"');
      auto end   = line.find('"', start + 1);
      if (start == std::string::npos || end == std::string::npos)
      {
        continue;
      }

      std::string include_file = line.substr(start + 1, end - start - 1);
      std::string full_path    = base_dir + "/" + include_file;

      if (include_guard.count(full_path))
      {
        continue;
      }

      include_guard.insert(full_path);

      std::string included = load_file(full_path);
      output << preprocess(included, base_dir, include_guard);
    }
    else
    {
      output << line << "\n";
    }
  }

  return output.str();
}

auto GLSLLoader::load(const std::string& path, const std::string& version,
                      const std::string& precision) -> std::string
{
  std::string source = load_file(path);
  if (source.empty())
  {
    return {};
  }

  // Strip BOM if present
  if (source.size() >= 3 && (unsigned char)source[0] == 0xEF && (unsigned char)source[1] == 0xBB &&
      (unsigned char)source[2] == 0xBF)
  {
    source.erase(0, 3);
  }

  // Remove leading whitespace/newlines
  while (!source.empty() && (source[0] == '\n' || source[0] == '\r' || source[0] == ' '))
  {
    source.erase(0, 1);
  }

  // Preprocess includes
  std::unordered_set<std::string> include_guard;
  std::string                     base_dir = path.substr(0, path.find_last_of('/'));
  source                                   = preprocess(source, base_dir, include_guard);

  // Inject version & precision
  std::stringstream final;
  final << "#version " << version << "\n";
  final << "precision " << precision << ";\n\n";
  final << source;

  return final.str();
}
