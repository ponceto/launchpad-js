#
# Makefile - Copyright (c) 2001-2024 - Olivier Poncet
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

# ----------------------------------------------------------------------------
# global variables
# ----------------------------------------------------------------------------

PYTHON    = /usr/bin/python3
HTTP_BIND = 127.0.0.1
HTTP_PORT = 8000

# ----------------------------------------------------------------------------
# global targets
# ----------------------------------------------------------------------------

all: build

build: do-build
	@echo "=== $@ done ==="

clean: do-clean
	@echo "=== $@ done ==="

serve: do-serve
	@echo "=== $@ done ==="

# ----------------------------------------------------------------------------
# hugo targets
# ----------------------------------------------------------------------------

do-build:
	@true

do-clean:
	@true

do-serve:
	$(PYTHON) -m http.server -b $(HTTP_BIND) $(HTTP_PORT)

# ----------------------------------------------------------------------------
# End-Of-File
# ----------------------------------------------------------------------------
