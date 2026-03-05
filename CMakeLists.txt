cmake_minimum_required(VERSION 3.5...4.2.1)
project(retro_site LANGUAGES C CXX)

# -----------------------------------------------------------
# ccache detect
# -----------------------------------------------------------
find_program(RETRO_CCACHE_PROGRAM ccache)

if(RETRO_CCACHE_PROGRAM)
    message(STATUS "ccache found: ${RETRO_CCACHE_PROGRAM}")
    message(STATUS "ccache enabled for C/C++ compilation")
    set(CMAKE_C_COMPILER_LAUNCHER   ${RETRO_CCACHE_PROGRAM})
    set(CMAKE_CXX_COMPILER_LAUNCHER ${RETRO_CCACHE_PROGRAM})
else()
    message(STATUS "ccache not found — builds will proceed without cache")
endif()

# -----------------------------------------------------------
# Build configuration
# -----------------------------------------------------------
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# -----------------------------------------------------------
# third_party dependencies
# -----------------------------------------------------------
set(THIRD_PARTY_DIR ${CMAKE_SOURCE_DIR}/third_party)

set(MD4C_DIR      ${THIRD_PARTY_DIR}/md4c)
set(STB_DIR       ${THIRD_PARTY_DIR}/stb)
set(FREETYPE_DIR  ${THIRD_PARTY_DIR}/freetype)

# Silence legacy policy warnings from third_party projects
set(CMAKE_POLICY_DEFAULT_CMP0048 NEW)
set(CMAKE_POLICY_DEFAULT_CMP0077 NEW)

# --- md4c (for markdown)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
add_subdirectory(${MD4C_DIR})

# --- stb (header-only)
add_library(stb INTERFACE)
target_include_directories(stb INTERFACE ${STB_DIR})

# -----------------------------------------------------------
# Sources
# -----------------------------------------------------------

file(GLOB_RECURSE RETRO_CORE_SOURCES
    CONFIGURE_DEPENDS
    ${CMAKE_SOURCE_DIR}/src/core/*.cc
    ${CMAKE_SOURCE_DIR}/src/core/*.cpp
)

file(GLOB_RECURSE RETRO_GL_SOURCES
    CONFIGURE_DEPENDS
    ${CMAKE_SOURCE_DIR}/src/gl/*.cc
    ${CMAKE_SOURCE_DIR}/src/gl/*.cpp
)

file(GLOB_RECURSE RETRO_SCENE_SOURCES
    CONFIGURE_DEPENDS
    ${CMAKE_SOURCE_DIR}/src/scene/*.cc
    ${CMAKE_SOURCE_DIR}/src/scene/*.cpp
)

set(RETRO_SITE_SOURCES
    src/main.cpp
    ${RETRO_CORE_SOURCES}
    ${RETRO_GL_SOURCES}
    ${RETRO_SCENE_SOURCES}
)

add_executable(${PROJECT_NAME} ${RETRO_SITE_SOURCES})

target_compile_options(${PROJECT_NAME}
    PRIVATE
        -Wall
        -Wextra
        -Wpedantic
)

# -----------------------------------------------------------
# Includes
# -----------------------------------------------------------
target_include_directories(${PROJECT_NAME}
    PRIVATE
        ${CMAKE_SOURCE_DIR}/src
        ${CMAKE_SOURCE_DIR}/include
        ${MD4C_DIR}/src
        ${STB_DIR}
)

set(RETRO_ASSETS_DIR "${CMAKE_SOURCE_DIR}/assets")

# -----------------------------------------------------------
# Assets (Emscripten Virtual FS)
# -----------------------------------------------------------

set(RETRO_ASSETS_DIR "${CMAKE_SOURCE_DIR}/assets")

set(RETRO_ASSET_FILES "")
set(RETRO_ASSET_VFS_PATHS "")
set(RETRO_PRELOAD_ASSETS "")

if(EXISTS "${RETRO_ASSETS_DIR}")

    # -------------------------------------------------------
    # Enumerate all asset files (for diagnostics only)
    # -------------------------------------------------------
    file(GLOB_RECURSE RETRO_ASSET_FILES
        RELATIVE "${RETRO_ASSETS_DIR}"
        "${RETRO_ASSETS_DIR}/*"
    )

    foreach(asset IN LISTS RETRO_ASSET_FILES)
        list(APPEND RETRO_ASSET_VFS_PATHS "/assets/${asset}")
    endforeach()

    # -------------------------------------------------------
    # Emscripten preload directive (linker option)
    # -------------------------------------------------------
    set(RETRO_PRELOAD_ASSETS
        "--preload-file=${RETRO_ASSETS_DIR}@/assets"
    )

else()
    message(STATUS "Assets directory not found: ${RETRO_ASSETS_DIR}")
endif()

# -----------------------------------------------------------
# Assets Summary
# -----------------------------------------------------------
if(RETRO_ASSET_VFS_PATHS)
    message(STATUS "${SEP}")
    message(STATUS "${SEP}  ── Preloaded Assets ─────────────────────────────")

    foreach(asset ${RETRO_ASSET_VFS_PATHS})
        message(STATUS "${SEP}  • ${asset}")
    endforeach()
else()
    message(STATUS "${SEP}")
    message(STATUS "${SEP}  ── Preloaded Assets ─────────────────────────────")
    message(STATUS "${SEP}  (none)")
endif()

target_link_options(${PROJECT_NAME}
    PRIVATE
        -sUSE_WEBGL2=1
        -sWASM=1
        -sALLOW_MEMORY_GROWTH=1
        ${RETRO_PRELOAD_ASSETS}
)

# -----------------------------------------------------------
# Link libraries
# -----------------------------------------------------------
target_link_libraries(${PROJECT_NAME}
    PRIVATE
        md4c
        stb
)

# -----------------------------------------------------------
# Output
# -----------------------------------------------------------
set_target_properties(${PROJECT_NAME} PROPERTIES
    OUTPUT_NAME "site"
)

# -----------------------------------------------------------
# Derived / Dynamic Build Info
# -----------------------------------------------------------
if(CMAKE_CROSSCOMPILING)
    set(RETRO_TOOLCHAIN_NAME "Emscripten")
else()
    set(RETRO_TOOLCHAIN_NAME "${CMAKE_CXX_COMPILER_ID}")
endif()

if(RETRO_PRELOAD_ASSETS)
    set(RETRO_ASSETS_STATUS "ENABLED (${RETRO_ASSETS_DIR})")
else()
    set(RETRO_ASSETS_STATUS "DISABLED")
endif()

if(TARGET md4c)
    set(RETRO_MD4C_STATUS "ON")
else()
    set(RETRO_MD4C_STATUS "OFF")
endif()

if(TARGET stb)
    set(RETRO_STB_STATUS "ON")
else()
    set(RETRO_STB_STATUS "OFF")
endif()

get_property(RETRO_COMPILE_FLAGS TARGET ${PROJECT_NAME} PROPERTY COMPILE_OPTIONS)
string(JOIN " " RETRO_COMPILE_FLAGS_STR ${RETRO_COMPILE_FLAGS})

# -----------------------------------------------------------
# Diagnostics Summary
# -----------------------------------------------------------
set(LINE_TOP    "┌──────────────────────── Build Summary ─────────────────────────┐")
set(LINE_BOTTOM "└────────────────────────────────────────────────────────────────┘")
set(SEP         "│")

message(STATUS "${LINE_TOP}")
message(STATUS "${SEP}  Project Name     : ${PROJECT_NAME}")
message(STATUS "${SEP}  Build Type       : ${CMAKE_BUILD_TYPE}")
message(STATUS "${SEP}  Toolchain        : ${RETRO_TOOLCHAIN_NAME}")
message(STATUS "${SEP}  C++ Standard     : C++${CMAKE_CXX_STANDARD}")
message(STATUS "${SEP}  Source Directory : ${CMAKE_SOURCE_DIR}")
message(STATUS "${SEP}")
message(STATUS "${SEP}  ── Web Capabilities ─────────────────────────────")
message(STATUS "${SEP}  • WebGL2         : ENABLED")
message(STATUS "${SEP}  • WASM           : ${CMAKE_CROSSCOMPILING}")
message(STATUS "${SEP}  • Assets FS      : ${RETRO_ASSETS_STATUS}")
message(STATUS "${SEP}")
message(STATUS "${SEP}  ── third_party ──────────────────────────────────")
message(STATUS "${SEP}  • md4c           : ${RETRO_MD4C_STATUS}")
message(STATUS "${SEP}  • stb            : ${RETRO_STB_STATUS}")
message(STATUS "${SEP}")
message(STATUS "${SEP}  ── Compiler Flags ───────────────────────────────")
message(STATUS "${SEP}    ${RETRO_COMPILE_FLAGS_STR}")
message(STATUS "${LINE_BOTTOM}")
