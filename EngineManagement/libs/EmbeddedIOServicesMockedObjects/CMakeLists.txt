# CMakeList.txt : CMake project for EmbeddedIOServices, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.8)

set(TARGET		EmbeddedIOServicesMockedObjects)

project(${TARGET} CXX)

# headers are always in include/
set(HDR_DIR		include)
file(GLOB_RECURSE HDRS ${HDR_DIR}/*.h)
include_directories(${HDR_DIR})

# create library
add_library(${TARGET} INTERFACE)
target_include_directories(${TARGET} INTERFACE ${HDR_DIR})
