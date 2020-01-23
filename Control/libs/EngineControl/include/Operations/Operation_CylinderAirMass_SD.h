#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "ScalarVariable.h"
#include "Interpolation.h"

#ifndef OPERATION_CYLINDERAIRMASS_SD
#define OPERATION_CYLINDERAIRMASS_SD
namespace Operations
{	
	class Operation_CylinderAirMass_SD : public IOperation<ScalarVariable, ScalarVariable, ScalarVariable, ScalarVariable>
	{
	protected:
		float _cylinderVolume;
	public:
		Operation_CylinderAirMass_SD(const float cylinderVolume);

		ScalarVariable Execute(ScalarVariable cylinderAirTemperature, ScalarVariable map, ScalarVariable VE) override;
		
		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif