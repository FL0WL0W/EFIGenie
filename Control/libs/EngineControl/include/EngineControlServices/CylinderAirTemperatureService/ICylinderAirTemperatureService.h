#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef ICYLINDERAIRTEMPERATURESERVICE_H
#define ICYLINDERAIRTEMPERATURESERVICE_H
namespace EngineControlServices
{			
	class ICylinderAirTemperatureService
	{
	public:
		float *CylinderAirTemperature = 0; //CylinderAirTemperature[Cylinder] g
		virtual void CalculateCylinderAirTemperature() = 0;

		static void CalculateCylinderAirTemperatureCallBack(void *cylinderTemperatureService);
		static void* CreateCylinderAirTemperatureService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif