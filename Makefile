# ============================================================
# mywebsite — Edge CDN Makefile
# ============================================================

PROJECT_NAME := mywebsite
EDGE_BINARY  := mywebsite

SRC_DIRS := src include
SHADER_DIRS := assets/shaders
BUILD_DIR := build
BUILD_DBG_DIR := build-dbg

# Tools
CLANG_FORMAT := clang-format
CLANG_TIDY   := clang-tidy
MAKE  := make
CMAKE := cmake
EMCMAKE := emcmake
CCACHE := ccache

EXTRA_CMAKE_FLAGS ?=

COMPILE_COMMANDS := $(BUILD_DIR)/compile_commands.json

# Find sources
CPP_FILES := $(shell find $(SRC_DIRS) -type f \( -name "*.cpp" -o -name "*.cc" -o -name "*.cxx" \))
HDR_FILES := $(shell find $(SRC_DIRS) -type f \( -name "*.h" -o -name "*.hpp" \))
GLSL_FILES := $(shell find $(SHADER_DIRS) -type f \( -name "*.glsl" -o -name "*.frag" -o -name "*.vert" \))

# ============================================================
# ANSI Colors
# ============================================================

COLOR_RESET := \033[0m
COLOR_BOLD  := \033[1m
COLOR_RED   := \033[31m
COLOR_GREEN := \033[32m
COLOR_YELLOW:= \033[33m
COLOR_BLUE  := \033[34m
COLOR_CYAN  := \033[36m

# ============================================================
# Phony targets
# ============================================================

.PHONY: \
	build buildx rebuild \
	build-dbg buildx-dbg rebuild-dbg \
	run run-dbg \
	clean fmt fmt-check tidy \
	test test-dbg \
	stats verify-deps install-deps \
	ccache-stats help

# ============================================================
# Release Build
# ============================================================

build:
	@echo -e "$(COLOR_BLUE)▶ Building Release...$(COLOR_RESET)"
	@$(CMAKE) --build $(BUILD_DIR)
	@echo -e "$(COLOR_GREEN)✔ Release build complete$(COLOR_RESET)"

buildx:
	@echo -e "$(COLOR_BLUE)▶ Configuring Release ($(BUILD_DIR))...$(COLOR_RESET)"
	@$(EMCMAKE) $(CMAKE) -S . -B $(BUILD_DIR) \
		-D CMAKE_BUILD_TYPE=Release \
		$(EXTRA_CMAKE_FLAGS)
	@$(MAKE) build

rebuild: clean buildx

# ============================================================
# Debug Build
# ============================================================

build-dbg:
	@echo -e "$(COLOR_BLUE)▶ Building Debug...$(COLOR_RESET)"
	@$(CMAKE) --build $(BUILD_DBG_DIR)
	@echo -e "$(COLOR_GREEN)✔ Debug build complete$(COLOR_RESET)"

buildx-dbg:
	@echo -e "$(COLOR_BLUE)▶ Configuring Debug ($(BUILD_DBG_DIR))...$(COLOR_RESET)"
	@$(EMCMAKE) $(CMAKE) -S . -B $(BUILD_DBG_DIR) \
		-D CMAKE_BUILD_TYPE=Debug \
		-D SEEDN_ENABLE_ASAN=ON \
		$(EXTRA_CMAKE_FLAGS)
	@$(MAKE) build-dbg

rebuild-dbg: clean buildx-dbg

# ============================================================
# Run
# ============================================================

run:
	@echo -e "$(COLOR_BLUE)▶ Running seeDN edge (Release)...$(COLOR_RESET)"
	@./$(BUILD_DIR)/$(EDGE_BINARY)

run-dbg:
	@echo -e "$(COLOR_BLUE)▶ Running seeDN edge (Debug)...$(COLOR_RESET)"
	@./$(BUILD_DBG_DIR)/$(EDGE_BINARY)

# ============================================================
# Tests
# ============================================================

test:
	@echo -e "$(COLOR_BLUE)▶ Running Release tests...$(COLOR_RESET)"
	@ctest --test-dir $(BUILD_DIR) --output-on-failure

test-dbg:
	@echo -e "$(COLOR_BLUE)▶ Running Debug tests...$(COLOR_RESET)"
	@ctest --test-dir $(BUILD_DBG_DIR) --output-on-failure

# ============================================================
# Formatting
# ============================================================

fmt:
	@echo -e "$(COLOR_BLUE)▶ Running clang-format...$(COLOR_RESET)"
	@for file in $(CPP_FILES) $(HDR_FILES) $(GLSL_FILES); do \
		echo -e "  $(COLOR_CYAN)fmt$(COLOR_RESET) $$file"; \
		$(CLANG_FORMAT) -i "$$file"; \
	done
	@echo -e "$(COLOR_GREEN)✔ Formatting complete$(COLOR_RESET)"

fmt-check:
	@echo -e "$(COLOR_BLUE)▶ Checking formatting...$(COLOR_RESET)"
	@for file in $(CPP_FILES) $(HDR_FILES); do \
		$(CLANG_FORMAT) --dry-run --Werror "$$file" || exit 1; \
	done
	@echo -e "$(COLOR_GREEN)✔ Formatting OK$(COLOR_RESET)"

# ============================================================
# Static Analysis
# ============================================================

tidy:
	@if [ ! -f "$(COMPILE_COMMANDS)" ]; then \
		echo -e "$(COLOR_RED)✗ compile_commands.json not found$(COLOR_RESET)"; \
		echo -e "  Hint: run 'make buildx' first"; \
		exit 1; \
	fi
	@echo -e "$(COLOR_BLUE)▶ Running clang-tidy...$(COLOR_RESET)"
	@$(CLANG_TIDY) $(CPP_FILES) -p $(BUILD_DIR)
	@echo -e "$(COLOR_GREEN)✔ clang-tidy finished$(COLOR_RESET)"

# ============================================================
# Cleanup
# ============================================================

clean:
	@echo -e "$(COLOR_BLUE)▶ Cleaning build directories...$(COLOR_RESET)"
	@rm -rf $(BUILD_DIR) $(BUILD_DBG_DIR)
	@echo -e "$(COLOR_GREEN)✔ Clean complete$(COLOR_RESET)"

# ============================================================
# Dependency Verification
# ============================================================

verify-deps:
	@echo -e "$(COLOR_BLUE)▶ Checking required tools...$(COLOR_RESET)"
	@for tool in cmake git clang-format clang-tidy; do \
		if command -v $$tool >/dev/null 2>&1; then \
			echo -e "  $(COLOR_GREEN)✔$(COLOR_RESET) $$tool"; \
		else \
			echo -e "  $(COLOR_RED)✗$(COLOR_RESET) $$tool (missing)"; \
			exit 1; \
		fi; \
	done
	@echo -e "$(COLOR_GREEN)✔ All required tools available$(COLOR_RESET)"

# ============================================================
# Stats
# ============================================================

stats:
	@echo -e "$(COLOR_BLUE)▶ Project statistics$(COLOR_RESET)"
	@echo -e "  Source files : $$(echo $(CPP_FILES) | wc -w)"
	@echo -e "  Header files : $$(echo $(HDR_FILES) | wc -w)"
	@echo -e "  Shader files : $$(echo $(GLSL_FILES) | wc -w)"
	@echo -e "  Total files  : $$(echo $(CPP_FILES) $(HDR_FILES) | wc -w)"

ccache-stats:
	@if command -v $(CCACHE) >/dev/null 2>&1; then \
		echo -e "$(COLOR_BLUE)▶ ccache stats$(COLOR_RESET)"; \
		$(CCACHE) -s; \
	else \
		echo -e "$(COLOR_YELLOW)ccache not installed$(COLOR_RESET)"; \
	fi

# ============================================================
# Help
# ============================================================

help:
	@echo ""
	@echo -e "$(COLOR_BOLD)$(COLOR_GREEN)seeDN Makefile — Targets$(COLOR_RESET)"
	@echo ""
	@echo -e "  $(COLOR_CYAN)buildx$(COLOR_RESET)        Configure + build Release"
	@echo -e "  $(COLOR_CYAN)buildx-dbg$(COLOR_RESET)    Configure + build Debug (ASAN)"
	@echo -e "  $(COLOR_CYAN)run$(COLOR_RESET)           Run Release edge binary"
	@echo -e "  $(COLOR_CYAN)run-dbg$(COLOR_RESET)       Run Debug edge binary"
	@echo -e "  $(COLOR_CYAN)fmt$(COLOR_RESET)           Format sources"
	@echo -e "  $(COLOR_CYAN)tidy$(COLOR_RESET)          Run clang-tidy"
	@echo -e "  $(COLOR_CYAN)test$(COLOR_RESET)          Run Release tests"
	@echo -e "  $(COLOR_CYAN)clean$(COLOR_RESET)         Remove build dirs"
	@echo ""
