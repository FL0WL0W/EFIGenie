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
uint16									14(FactoryID)
MathOperation							Operation

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									14(FactoryID)
uint16									xx(InstanceID of Variable Result)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable X)
uint16									xx(InstanceID of Variable Y)
*/

#ifndef OPERATION_MATH_H
#define OPERATION_MATH_H
namespace Operations
{
	enum MathOperation : uint8_t
	{
		ADD = 0,
		SUBTRACT = 1,
		MULTIPLY = 2,
		DIVIDE = 3,
		AND = 4,
		OR = 5,
		GREATERTHAN = 6,
		LESSTHAN = 7,
		EQUAL = 8,
		GREATERTHANOREQUAL = 9,
		LESSTHANOREQUAL = 10
	};

	class Operation_Math : public IOperation<ScalarVariable, ScalarVariable, ScalarVariable>
	{
	protected:
		MathOperation _operation;
	public:		
        Operation_Math(MathOperation operation);

		ScalarVariable Execute(ScalarVariable x, ScalarVariable y) override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif