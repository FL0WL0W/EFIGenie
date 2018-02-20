#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	TEST_MODULE_INITIALIZE(ModuleInitialize)
	{
		// enable google mock
		::testing::GTEST_FLAG(throw_on_failure) = true;
		int argc = 0;
		char **argv = NULL;
		::testing::InitGoogleMock(&argc, argv);
	}
}