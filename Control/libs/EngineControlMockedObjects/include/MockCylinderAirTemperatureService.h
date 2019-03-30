#include "EngineControlServices/CylinderAirTemperatureService/ICylinderAirTemperatureService.h"

#ifndef MOCKCYLINDERAIRTEMPERATURESERVICE_H
#define MOCKCYLINDERAIRTEMPERATURESERVICE_H
namespace EngineControlServices
{
	class MockCylinderAirTemperatureService : public ICylinderAirTemperatureService
	{
	public:
		MOCK_METHOD0(CalculateCylinderAirTemperature, void());
	};
}
#endif