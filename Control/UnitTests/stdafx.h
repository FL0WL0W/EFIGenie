// stdafx.h : include file for standard system include files,
// or project specific include files that are used frequently, but
// are changed infrequently
//

#pragma once

#include "targetver.h"

// Headers for CppUnitTest
#include "CppUnitTest.h"

// TODO: reference additional headers your program requires here
#define _TEST_METHOD_EX_EXPANDER(_testMethod)\
    _testMethod { try

// Adds support for seeing std::exception in test output. Requires TEST_METHOD_EX_END after test.
// Example:
// TEST_METHOD_EX_BEGIN(MyFailingTest){ throw std::exception("What happened"); } TEST_METHOD_EX_END;
#define TEST_METHOD_EX_BEGIN(_methodName) _TEST_METHOD_EX_EXPANDER(TEST_METHOD(_methodName))

// Use following test declared with TEST_METHOD_EX_BEGIN
#define TEST_METHOD_EX_END\
    catch (::std::exception& ex) \
    { \
::std::wstringstream ws; ws << "Unhandled Exception:" << ::std::endl << ex.what(); \
::Microsoft::VisualStudio::CppUnitTestFramework::Assert::Fail(ws.str().c_str());\
    } \
}