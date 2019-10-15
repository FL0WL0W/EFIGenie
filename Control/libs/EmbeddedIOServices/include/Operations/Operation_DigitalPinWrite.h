#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "ScalarVariable.h"

/*
To create this operator
uint16									6001(BUILDER_OPERATION)
uint16									xx(InstanceID of Operation)
uint16									10(FactoryID)
uint16 									pin
bool 									normalOn
bool 									highZ

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									10(FactoryID)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable)

To create a CallBack to use this operator on a variable
uint16									7002(BUILDER_VARIABLE_TRANSLATE_CALL_BACK)
uint16									xx(InstanceID of CallBack)
uint16									10(FactoryID)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable)
*/

#ifndef OPERATION_DIGITALPINWRITE_H
#define OPERATION_DIGITALPINWRITE_H
namespace Operations
{
	class Operation_DigitalPinWrite : public IOperation<void, ScalarVariable>
	{
	protected:
		HardwareAbstraction::IDigitalService *_digitalService;
		uint16_t _pin;
		bool _normalOn;
		bool _highZ;
	public:		
        Operation_DigitalPinWrite(HardwareAbstraction::IDigitalService *digitalService, uint16_t pin, const bool normalOn, const bool highZ);

		void Execute(ScalarVariable x) override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif