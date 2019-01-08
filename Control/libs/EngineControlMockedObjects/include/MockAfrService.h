#include "EngineControlServices/AfrService/IAfrService.h"

#ifndef MOCKAFRSERVICE_H
#define MOCKAFRSERVICE_H
namespace EngineControlServices
{
	class MockAfrService : public IAfrService
	{
	public:
		MOCK_METHOD0(CalculateAfr, void());
	};
}
#endif