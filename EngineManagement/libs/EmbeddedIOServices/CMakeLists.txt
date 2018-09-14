# CMakeList.txt : CMake project for EmbeddedIOServices, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.8)

set(TARGET		EmbeddedIOServices)

project(${TARGET} CXX)

# headers are always in include/
set(HDR_DIR		include)
file(GLOB_RECURSE HDRS ${HDR_DIR}/*.h)
include_directories(${HDR_DIR})
# sources are always in src/
set(SRCS_DIR	src)
file(GLOB_RECURSE SRCS ${SRCS_DIR}/*.cpp)

# create library
add_library(${TARGET} STATIC ${HDRS} ${SRCS})
target_include_directories(${TARGET} PUBLIC ${HDR_DIR})
