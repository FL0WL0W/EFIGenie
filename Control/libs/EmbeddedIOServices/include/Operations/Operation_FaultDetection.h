#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Packed.h"
#include "Interpolation.h"
#include "ScalarVariable.h"

/*
To create this operator
uint16									6001(BUILDER_OPERATION)
uint16									xx(InstanceID of Operation)
uint16									9(FactoryID)
float 									MinValue
float 									MaxValue
float 									DefaultValue

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									9(FactoryID)
uint16									xx(InstanceID of Variable Result)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable Input)
*/

#ifndef OPERATION_FAULTDETECTION_H
#define OPERATION_FAULTDETECTION_H
namespace Operations
{
	PACK(
	struct Operation_FaultDetectionConfig
	{
	public:
		constexpr const unsigned int Size() const
		{
			return sizeof(Operation_FaultDetectionConfig);
		}
		
		float MinValue;
		float MaxValue;
		float DefaultValue;
	});

	class Operation_FaultDetection : public IOperation<ScalarVariable, ScalarVariable>
	{
	protected:
		const Operation_FaultDetectionConfig *_config;
	public:		
        Operation_FaultDetection(const Operation_FaultDetectionConfig * const &config);

		ScalarVariable Execute(ScalarVariable x) override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif