#include "Operations/IOperation.h"

#ifndef MOCKOUTPUTOPERATION_H
#define MOCKOUTPUTOPERATION_H
namespace OperationArchitecture
{
	class MockOutputOperation : public IOperation<void, bool>
	{
	public:
		MOCK_METHOD1(Execute, void(bool));
	};
}
#endif