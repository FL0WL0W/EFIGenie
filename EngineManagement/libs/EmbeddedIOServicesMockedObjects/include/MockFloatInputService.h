#include "IOServices/FloatInputService/IFloatInputService.h"

#ifndef MOCKFLOATINPUTSERVICE_H
#define MOCKFLOATINPUTSERVICE_H
namespace IOServices
{
	class MockFloatInputService : public IFloatInputService
	{
	public:
		MOCK_METHOD0(ReadValue, void());
	};
}
#endif