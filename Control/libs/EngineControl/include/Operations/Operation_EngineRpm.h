#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePosition.h"
#include "ScalarVariable.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"

#ifndef OPERATION_ENGINERPM_H
#define OPERATION_ENGINERPM_H
namespace Operations
{
	class Operation_EngineRpm : public Operations::IOperation<ScalarVariable, EnginePosition>
	{
	public:		
        Operation_EngineRpm();

		ScalarVariable Execute(EnginePosition enginePosition) override;

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif