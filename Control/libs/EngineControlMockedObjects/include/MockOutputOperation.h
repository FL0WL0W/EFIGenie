#include "Operations/IOperation.h"

#ifndef MOCKOUTPUTOPERATION_H
#define MOCKOUTPUTOPERATION_H
namespace Operations
{
	class MockOutputOperation : public IOperation<void, ScalarVariable>
	{
	public:
		MOCK_METHOD1(Execute, void(ScalarVariable));
	};
}
#endif