# CMakeList.txt : CMake project for EngineControl, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.8)

set(TARGET		TransmissionControl)
set(HDR_DIR		include)
set(SRCS_DIR		src)

project(${TARGET} CXX)

# headers are always in include/
file(GLOB_RECURSE HDRS ${HDR_DIR}/*.h)
include_directories(${HDR_DIR})
# sources are always in src/
file(GLOB_RECURSE SRCS ${SRCS_DIR}/*.cpp)

# create library
add_library(${TARGET} STATIC ${HDRS} ${SRCS})
target_include_directories(${TARGET} PUBLIC ${HDR_DIR})
target_link_libraries(${TARGET} EmbeddedIOServices)
target_link_libraries(${TARGET} Reluctor)
