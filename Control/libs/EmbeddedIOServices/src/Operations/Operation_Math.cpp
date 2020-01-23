#include "Operations/Operation_Math.h"

#ifdef OPERATION_MATH_H
namespace Operations
{
	Operation_Math::Operation_Math(MathOperation operation)
	{
		_operation = operation;
	}

	ScalarVariable Operation_Math::Execute(ScalarVariable x, ScalarVariable y)
	{
		switch (_operation)
		{
			case ADD:
				return x + y;
			case SUBTRACT:
				return x - y;
			case MULTIPLY:
				return x * y;
			case DIVIDE:
				return x / y;
			case AND:
				return x & y;
			case OR:
				return x | y;
			case GREATERTHAN:
				return ScalarVariable((x > y));
			case LESSTHAN:
				return ScalarVariable((x < y));
			case GREATERTHANOREQUAL:
				return ScalarVariable((x >= y));
			case EQUAL:
				return ScalarVariable((x == y));
			case LESSTHANOREQUAL:
				return ScalarVariable((x <= y));
		}
		return ScalarVariable(static_cast<uint8_t>(0));
	}

	IOperationBase * Operation_Math::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return new Operation_Math(IService::CastAndOffset<MathOperation>(config, sizeOut));
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_Math, 14)
}
#endif