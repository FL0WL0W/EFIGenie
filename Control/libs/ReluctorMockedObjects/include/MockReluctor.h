#include "Reluctor/IReluctor.h"

#ifndef MOCKRELUCTOR_H
#define MOCKRELUCTOR_H
namespace Reluctor
{
	class MockReluctor : public IReluctor
	{
	public:
		MOCK_METHOD0(GetPosition, float());
		MOCK_METHOD0(GetTickPerDegree, uint32_t());
		MOCK_METHOD0(GetRpm, uint16_t());
		MOCK_METHOD0(GetResolution, uint16_t());
		MOCK_METHOD0(IsSynced, bool());
	};
}
#endif