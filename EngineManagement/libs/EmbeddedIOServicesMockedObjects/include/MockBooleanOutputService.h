#include "IOServices/BooleanOutputService/IBooleanOutputService.h"

#ifndef MOCKBOOLEANOUTPUTSERVICE_H
#define MOCKBOOLEANOUTPUTSERVICE_H
namespace IOServices
{
	class MockBooleanOutputService : public IBooleanOutputService
	{
	public:
		MOCK_METHOD0(OutputSet, void());
		MOCK_METHOD0(OutputReset, void());
		MOCK_METHOD1(OutputWrite, void(bool));
	};
}
#endif