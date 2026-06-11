#!/usr/bin/env bash

# ============================================================
# run-website.sh
# ============================================================

set -euo pipefail

PORT="${PORT:-8080}"
HOST="127.0.0.1"
HOME_PAGE=""
PID_FILE=".run-website.pid"
LOG_FILE=".run-website.log"
OPEN_URL="http://${HOST}:${PORT}/${HOME_PAGE}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPA_SERVER="${SCRIPT_DIR}/spa_server.py"

RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
CYAN="\033[36m"
BLUE="\033[34m"

log_info()  { echo -e "  ${BLUE}▶${RESET} $*"; }
log_ok()    { echo -e "  ${GREEN}✔${RESET} $*"; }
log_warn()  { echo -e "  ${YELLOW}⚠${RESET} $*"; }
log_error() { echo -e "  ${RED}✗${RESET} $*" >&2; }
log_step()  { echo -e "\n${BOLD}${CYAN}$*${RESET}"; }

open_browser() {
    local url="$1"
    if command -v xdg-open &>/dev/null; then
        xdg-open "$url" &>/dev/null &
    elif command -v open &>/dev/null; then
        open "$url" &>/dev/null &
    elif command -v wslview &>/dev/null; then
        wslview "$url" &>/dev/null &
    else
        log_warn "Could not detect a browser opener. Visit manually: ${url}"
    fi
}

wait_for_server() {
    local retries=20
    while (( retries-- > 0 )); do
        if curl -fs --max-time 1 "http://${HOST}:${PORT}/" &>/dev/null 2>&1 || \
           python3 -c "import socket; s=socket.create_connection(('${HOST}', ${PORT}), 1); s.close()" &>/dev/null 2>&1; then
            return 0
        fi
        sleep 0.25
    done
    return 1
}

is_running() {
    [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" &>/dev/null 2>&1
}

stop_server() {
    if [[ ! -f "$PID_FILE" ]]; then
        log_warn "No PID file found (${PID_FILE}). Server may not be running."
        return 0
    fi

    local pid
    pid=$(cat "$PID_FILE")

    log_step "Stopping server (PID ${pid})..."

    if kill -0 "$pid" &>/dev/null 2>&1; then
        kill "$pid"
        local waited=0
        while kill -0 "$pid" &>/dev/null 2>&1 && (( waited < 10 )); do
            sleep 0.5
            (( waited++ )) || true
        done

        if kill -0 "$pid" &>/dev/null 2>&1; then
            log_warn "Process did not exit gracefully, force-killing..."
            kill -9 "$pid" || true
        fi

        log_ok "Server stopped."
    else
        log_warn "PID ${pid} was not running."
    fi

    rm -f "$PID_FILE"
}

cmd_start() {
    log_step "emwebsiten — HTTP Server"

    if is_running; then
        local pid; pid=$(cat "$PID_FILE")
        log_warn "Server already running (PID ${pid}). Use '$0 stop' to stop it."
        exit 0
    fi

    # Validate Python
    if ! command -v python3 &>/dev/null; then
        log_error "python3 not found. Please install Python 3."
        exit 1
    fi

    log_info "Starting SPA HTTP server on ${HOST}:${PORT}..."
    log_info "Serving directory: $(pwd)"
    log_info "Log file: ${LOG_FILE}"

    # Launch daemonized SPA server (falls back to index.html for routes)
    nohup python3 -u "$SPA_SERVER" \
        --host "$HOST" \
        --port "$PORT" \
        --directory "$(pwd)" \
        > "$LOG_FILE" 2>&1 &

    local server_pid=$!
    echo "$server_pid" > "$PID_FILE"
    log_info "Server daemonized (PID ${server_pid})"

    # Wait until port is accepting connections
    log_info "Waiting for server to become ready..."
    if wait_for_server; then
        log_ok "Server is up at http://${HOST}:${PORT}"
    else
        log_error "Server did not become ready in time. Check ${LOG_FILE} for details."
        stop_server
        exit 1
    fi

    # Open browser
    log_info "Opening ${OPEN_URL} in browser..."
    open_browser "$OPEN_URL"
    log_ok "Done. Use 'make website-stop' or '$0 stop' to shut down."
}

cmd_stop() {
    stop_server
}

cmd_status() {
    log_step "Server Status"
    if is_running; then
        local pid; pid=$(cat "$PID_FILE")
        log_ok "Running (PID ${pid}) → http://${HOST}:${PORT}"
    else
        log_warn "Not running."
    fi
}

cmd_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        tail -f "$LOG_FILE"
    else
        log_warn "No log file found (${LOG_FILE})."
    fi
}

trap 'stop_server; exit 0' INT TERM

SUBCMD="${1:-start}"

case "$SUBCMD" in
    start)  cmd_start  ;;
    stop)   cmd_stop   ;;
    status) cmd_status ;;
    logs)   cmd_logs   ;;
    restart)
        cmd_stop
        sleep 0.5
        cmd_start
        ;;
    *)
        echo -e "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
