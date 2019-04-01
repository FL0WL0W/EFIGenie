#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"

#ifndef MOCKCYLINDERAIRMASSSERVICE_H
#define MOCKCYLINDERAIRMASSSERVICE_H
namespace EngineControlServices
{
	class MockCylinderAirmassService : public ICylinderAirmassService
	{
	public:
		MOCK_METHOD0(CalculateCylinderAirmass, void());
	};
}
#endif