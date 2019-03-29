#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef ICYLINDERAIRMASSSERVICE_H
#define ICYLINDERAIRMASSSERVICE_H
namespace EngineControlServices
{			
	class ICylinderAirmassService
	{
	public:
		float *CylinderAirmass = 0; //CylinderAirmass[Cylinder] g
		virtual void CalculateCylinderAirmass() = 0;

		static void CalculateCylinderAirmassCallBack(void *cylinderAirmassService);
		static void* CreateCylinderAirmassService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif